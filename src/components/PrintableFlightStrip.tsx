import React from 'react';
import ReactDOM from "react-dom";
import {FixType, LocalEdstEntryType} from "../types";
import {computeCrossingTimes, formatUtcMinutes, getNextFix} from "../lib";
import {Position} from "@turf/turf";

function getRouteString(entry: LocalEdstEntryType) {
  const route = (entry._route?.length
      ? entry?.route?.concat(entry?.dest ?? '')
      : entry?._route?.replace(/^\.*/, '')?.concat(entry?.dest ?? ''))
    ?? '';
  return (entry.cleared_direct?.fix && route.startsWith(entry.cleared_direct?.fix)
      ? entry.cleared_direct?.frd + '..'
      : entry?.dep ?? '') + route;
}

export function printFlightStrip(entry?: LocalEdstEntryType) {
  if (entry) {
    const printDoc = document.getElementById('toPrint')
    if (printDoc) {
      ReactDOM.unmountComponentAtNode(printDoc);
    }
    const pos = [Number(entry.flightplan.lon), Number(entry.flightplan.lat)] as Position;
    const [nextFix, prevFix] = getNextFix(entry.route, computeCrossingTimes(entry), pos) as (FixType & {minutesAtFix: number})[];
    ReactDOM.render(<PrintableFlightStrip
      fs={{
        rev: '1',
        callsign: entry.callsign,
        type: entry.type,
        tas: 'TXXX',
        sect: 'XXX',
        cid: entry.cid,
        estGs: entry.flightplan.ground_speed,
        stripReqOrig: 'XXX',
        stripNum: '1',
        prev: prevFix?.name ?? '',
        prevTime: '',
        prevTimeRev: '',
        prevTimeAct: '',
        postedFixTime: '',
        currTimeCentre: '',
        directionArrow: '',
        currTimePilot: '',
        currTimeAct: '',
        curr: '',
        alt: entry.altitude,
        next: nextFix?.name ?? '',
        nextTime: nextFix? formatUtcMinutes(nextFix.minutesAtFix) : '',
        dofArrow: '',
        reqAlt: '',
        route: getRouteString(entry),
        remarks: entry.remarks.split('RMK')?.pop() ?? '',
        squawk: entry.beacon,
        misc: '',
        trans1: '',
        trans2: ''
      }}
    />, document.getElementById('toPrint'))
    let printer = window.open("") as Window;
    const innerHTML = document.getElementById("toPrint")?.innerHTML;
    if (innerHTML) {
      try {
        printer.document.write(innerHTML);
        printer.print();
        printer.close();
      } catch (e) {
      }
    }
  }
}

function PrintableFlightStrip(props: any) {
  const {fs} = props;
  const rootTdStyle = {
    borderRight: '1px solid black',
    padding: '0px'
  };
  return (
    <div className="printable-flight-strip">
      <table style={{border: '1px solid black'}}>
        <tbody>
        <tr>
          <td style={rootTdStyle}>
            <table style={{width: "160px"}}>
              <tbody>
              <tr>
                <td style={{textAlign: "left"}}>{fs.callsign}</td>
                <td/>
                <td style={{textAlign: "right"}}>{fs.rev}</td>
              </tr>
              <tr>
                <td>{fs.type}</td>
              </tr>
              <tr>
                <td>{fs.tas}</td>
                <td>?</td>
                {/*TODO what number is this? GS?*/}
              </tr>
              <tr>
                <td style={{textAlign: "right"}}>{fs.sect}</td>
                <td style={{textAlign: "right"}}>16</td>
                {/*TODO what number is this?*/}
              </tr>
              <tr>
                <td style={{textAlign: "left"}}>486</td>
                {/*TODO what number is this? CID?*/}
                <td style={{textAlign: "right"}}>09</td>
                {/*TODO what number is this?*/}
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{width: "70px"}}>
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
                <td>{fs.postedTime}</td>
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{borderCollapse: "collapse", width: "170px"}}>
              <tbody>
              <tr>
                <td style={{textAlign: "center"}}>{fs.currTimeCentre}</td>
                <td style={{textAlign: "center", paddingRight: "9px"}}>{fs.directionArrow}</td>
              </tr>
              <tr>
                <td/>
              </tr>
              <tr>
                <td/>
              </tr>
              <tr style={{height: "42px"}}>
                <td style={{border: "1px solid black", textAlign: "center", width: "50%"}}>{fs.currTimePilot}</td>
                <td style={{border: "1px solid black", textAlign: "center"}}>{fs.currTimeAct}</td>
              </tr>
              <tr>
                <td style={{paddingLeft: "10px", textAlign: "left"}}>{fs.curr}</td>
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{width: "80px"}}>
              <tbody>
              <tr>
                <td style={{textAlign: "left", paddingLeft: "10px"}}>{fs.alt}</td>
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{width: "90px", textAlign: "left", paddingLeft: "10px"}}>
              <tbody>
              <tr>
                <td style={{paddingBottom: "5px"}}>{fs.nextPosted}</td>
              </tr>
              <tr>
                <td>{fs.next}</td>
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
            <table style={{width: "180px", textAlign: "left", paddingLeft: "10px"}}>
              <tbody>
              <tr>
                <td style={{paddingBottom: "70px", overflowWrap: 'anywhere'}}>{fs.route}</td>
              </tr>
              <tr>
                <td>{fs.remarks}</td>
              </tr>
              </tbody>
            </table>
          </td>
          <td>
            <table style={{width: "100px", textAlign: "left", paddingLeft: "10px"}}>
              <tbody>
              <tr>
                <td>{fs.squawk}</td>
              </tr>
              <tr>
                <td style={{paddingBottom: "50px"}}>{fs.misc}</td>
              </tr>
              <tr>
                <td>{fs.trans1}</td>
                <td style={{textAlign: "right", paddingLeft: "0px", paddingRight: "10px"}}>{fs.trans2}</td>
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