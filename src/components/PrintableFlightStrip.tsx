import React from "react";
import ReactDOM from "react-dom";
import { convertBeaconCodeToString, formatUtcMinutes } from "../lib";
import { EdstEntry } from "../types/edstEntry";

function getRouteString(entry: EdstEntry) {
  return (
    (entry.currentRoute?.length
      ? entry?.route?.concat(entry?.destination ?? "")
      : entry?.currentRoute?.replace(/^\.*/, "")?.concat(entry?.destination ?? "")) ?? ""
  );
}

export function printFlightStrip(entry?: EdstEntry) {
  if (entry) {
    const printDoc = document.getElementById("toPrint");
    if (printDoc) {
      ReactDOM.unmountComponentAtNode(printDoc);
    }
    // const pos = [Number(entry.flightplan.lon), Number(entry.flightplan.lat)] as Position;
    // const [nextFix, prevFix] = getNextFix(entry.route, computeCrossingTimes(entry), pos) as (RouteFix & { minutesAtFix: number })[];
    const [nextFix, prevFix]: [any, any] = [null, null];
    ReactDOM.render(
      <PrintableFlightStrip
        fs={{
          callsign: entry.aircraftId, // callsign
          type: entry.equipment, // weight, type, equipment suffix
          tas: "TXXX", // true airspeed
          sect: "XX", // current sector
          aircraftId: entry.aircraftId, // cid
          estGs: `G${entry.speed}`, // filed ground speed
          stripReqOrig: "XXX", // strip request origin
          stripNum: "1", // strip number
          prev: prevFix?.name ?? "", // previous fix
          prevTime: "", // previous fix timestamp
          prevTimeRev: "", // previous fix timestamp, revised
          prevTimeAct: "", // previous fix timestamp, actual
          postedFixTime: "", // posted fix timestamp
          currTimeCentre: "", // current fix timestamp, from centre
          directionArrow: "", // departure/arrival arrow
          currTimePilot: "", // current fix timestamp, from pilot
          currTimeAct: "", // current fix timestamp, actual
          curr: "", // current fix / departure time
          alt: entry.altitude, // assigned altitude
          next: nextFix?.name ?? "", // next fix
          nextTime: nextFix ? formatUtcMinutes(nextFix.minutesAtFix) : "", // next fix timestamp
          dofArrow: "", // direction of flight arrow
          reqAlt: "", // requested altitude
          route: getRouteString(entry)
            .split(".")
            .filter(x => x !== "")
            .join(" "), // route
          remarks: filterRemarks(entry.remarks), // remarks
          squawk: convertBeaconCodeToString(entry.assignedBeaconCode), // squawk code
          misc: "", // miscellaneous info
          trans1: "", // transfer of control info
          trans2: "" // transfer of control info
        }}
      />,
      document.getElementById("toPrint")
    );
    const printer = window.open("") as Window;
    const innerHTML = document.getElementById("toPrint")?.innerHTML;
    if (innerHTML) {
      try {
        printer.document.write(innerHTML);
        printer.print();
        printer.close();
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  }
}

function filterRemarks(remarks: string): string {
  remarks = remarks.split("RMK")?.pop() ?? "";

  remarks = removeRemark(remarks, "EET");
  remarks = removeRemark(remarks, "REG");

  let index = remarks.indexOf("RALT");
  remarks = index !== -1 ? remarks.slice(0, index) + remarks.slice(index + 9) : remarks;

  index = remarks.indexOf("/TCAS SIMBRIEF");
  remarks = index !== -1 ? remarks.slice(0, index) + remarks.slice(index + 15) : remarks;

  return remarks;
}

function removeRemark(remarks: string, remark: string): string {
  if (remarks.indexOf(remark) > -1) {
    remark += "/";
    const rem = remarks.split(remark)?.pop() ?? "";
    const remS = rem.split("/");
    remS.shift();
    remS.pop();
    remarks = `${remarks.split(remark)[0] + rem.split("/")[0].slice(-3)}/${remS.join("/")}`;
  }
  return remarks;
}

function PrintableFlightStrip(props: any) {
  const { fs } = props;
  const rootTdStyle = {
    borderRight: "1px solid black",
    padding: "0px"
  };
  /* TODO find good font */
  /* TODO replace with grid/better solution */
  return (
    <div className="printable-flight-strip">
      <table style={{ border: "1px solid black" }}>
        <tbody>
          <tr>
            <td style={rootTdStyle}>
              <table style={{ width: "130", textAlign: "center" }}>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "20.8px", paddingBottom: "10px" }}>{fs.callsign}</td>
                  </tr>
                  <tr>
                    <td>{fs.type}</td>
                  </tr>
                  <tr>
                    <td>{fs.tas}</td>
                    <td>{fs.estGs}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "right" }}>{fs.sect}</td>
                    <td>{fs.sect}</td>
                  </tr>
                  <tr>
                    <td>{fs.cid}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={rootTdStyle}>
              <table style={{ width: "60px" }}>
                <tbody>
                  <tr>
                    <td>{fs.prev}</td>
                  </tr>
                  <tr>
                    <td>{fs.prevTime}</td>
                  </tr>
                  <tr>
                    <td>{fs.prevTimeRev}</td>
                  </tr>
                  <tr>
                    <td>{fs.prevTimeAct}</td>
                  </tr>
                  <tr>
                    <td>{fs.postedFixTime}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={rootTdStyle}>
              <table style={{ borderCollapse: "collapse", width: "170px" }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "center" }}>{fs.currTimeCentre}</td>
                    <td style={{ textAlign: "center", paddingRight: "9px" }}>{fs.directionArrow}</td>
                  </tr>
                  <tr>
                    <td />
                  </tr>
                  <tr>
                    <td />
                  </tr>
                  <tr style={{ height: "42px", overflow: "hidden" }}>
                    <td style={{ border: "1px solid black", textAlign: "center", width: "50%" }}>{fs.currTimePilot}</td>
                    <td style={{ border: "1px solid black", textAlign: "center", width: "50%" }}>{fs.currTimeAct}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: "10px", textAlign: "left" }}>{fs.curr}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={rootTdStyle}>
              <table style={{ width: "80px" }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", paddingBottom: "70px" }}>{fs.alt}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={rootTdStyle}>
              <table style={{ width: "40px", textAlign: "left" }}>
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: "5px" }}>{fs.next}</td>
                  </tr>
                  <tr>
                    <td>{fs.nextTime}</td>
                  </tr>
                  <tr>
                    <td>{fs.dofArrow}</td>
                  </tr>
                  <tr>
                    <td>{fs.reqAlt}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={rootTdStyle}>
              <table style={{ width: "220px", textAlign: "left", paddingLeft: "10px" }}>
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: "70px", overflowWrap: "anywhere" }}>{fs.route}</td>
                  </tr>
                  <tr>
                    <td>{fs.remarks}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td>
              <table style={{ width: "50px" }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "right", paddingLeft: "20px", paddingBottom: "50px" }}>{fs.squawk}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "50px" }}>{fs.misc}</td>
                  </tr>
                  <tr>
                    <td>{fs.trans1}</td>
                    <td style={{ textAlign: "right", paddingLeft: "0px", paddingRight: "10px" }}>{fs.trans2}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
