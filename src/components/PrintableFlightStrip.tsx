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
        rev: '1',                                                         // revision
        callsign: entry.callsign,                                         // callsign
        type: entry.type,                                                 // weight, type, equipment suffix
        tas: 'TXXX',                                                      // true airspeed
        sect: 'XXX',                                                      // current sector
        cid: entry.cid,                                                   // cid
        estGs: entry.flightplan.ground_speed,                             // filed ground speed
        stripReqOrig: 'XXX',                                              // strip request origin
        stripNum: '1',                                                    // strip number
        prev: prevFix?.name ?? '',                                        // previous fix
        prevTime: '',                                                     // previous fix timestamp
        prevTimeRev: '',                                                  // previous fix timestamp, revised
        prevTimeAct: '',                                                  // previous fix timestamp, actual
        postedFixTime: '',                                                // posted fix timestamp
        currTimeCentre: '',                                               // current fix timestamp, from centre
        directionArrow: '',                                               // departure/arrival arrow
        currTimePilot: '',                                                // current fix timestamp, from pilot
        currTimeAct: '',                                                  // current fix timestamp, actual
        curr: '',                                                         // current fix / departure time
        alt: entry.altitude,                                              // assigned altitude
        next: nextFix?.name ?? '',                                        // next fix
        nextTime: nextFix? formatUtcMinutes(nextFix.minutesAtFix) : '',   // next fix timestamp
        dofArrow: '',                                                     // direction of flight arrow
        reqAlt: '',                                                       // requested altitude
        route: getRouteString(entry).split('.').join(' '),        // route
        remarks: entry.remarks.split('RMK')?.pop() ?? '',         // remarks
        squawk: entry.beacon,                                             // squawk code
        misc: '',                                                         // miscellaneous info
        trans1: '',                                                       // transfer of control info
        trans2: ''                                                        // transfer of control info
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
                <td style={{textAlign: "left"}}>{fs.callsign}</td> {/* block 3 */}
                <td/>
                <td style={{textAlign: "right"}}>{fs.rev}</td> {/* block 2 */}
              </tr>
              <tr>
                <td>{fs.type}</td> {/* block 4 */}
              </tr>
              <tr>
                <td>{fs.tas}</td> {/* block 5 */}
                <td>?</td>
                {/*TODO what number is this? GS?*/}
              </tr>
              <tr>
                <td style={{textAlign: "right"}}>{fs.sect}</td> {/* block 6 */}
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
                <td>{fs.prev}</td> {/* block 11 */}
              </tr>
              <tr>
                <td>{fs.prevTime}</td> {/* block 12 */}
              </tr>
              <tr>
                <td>{fs.prevTimeRev}</td> {/* block 13 */}
              </tr>
              <tr>
                <td>{fs.prevTimeAct}</td> {/* block 14 */}
              </tr>
              <tr>
                <td>{fs.postedFixTime}</td> {/* block 14a */}
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{borderCollapse: "collapse", width: "170px"}}>
              <tbody>
              <tr>
                <td style={{textAlign: "center"}}>{fs.currTimeCentre}</td> {/* block 15 */}
                <td style={{textAlign: "center", paddingRight: "9px"}}>{fs.directionArrow}</td> {/* block 16 */}
              </tr>
              <tr>
                <td/>
              </tr>
              <tr>
                <td/>
              </tr>
              <tr style={{height: "42px"}}>
                <td style={{border: "1px solid black", textAlign: "center", width: "50%"}}>{fs.currTimePilot}</td> {/* block 17 */}
                <td style={{border: "1px solid black", textAlign: "center"}}>{fs.currTimeAct}</td> {/* block 18 */}
              </tr>
              <tr>
                <td style={{paddingLeft: "10px", textAlign: "left"}}>{fs.curr}</td> {/* block 19 */}
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{width: "80px"}}>
              <tbody>
              <tr>
                <td style={{textAlign: "left", paddingLeft: "10px"}}>{fs.alt}</td> {/* block 20 */}
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{width: "90px", textAlign: "left", paddingLeft: "10px"}}>
              <tbody>
              <tr>
                <td style={{paddingBottom: "5px"}}>{fs.next}</td> {/* block 21 */}
              </tr>
              <tr>
                <td>{fs.nextTime}</td> {/* block 22 */}
              </tr>
              <tr>
                <td>{fs.dofArrow}</td> {/* block 23 */}
              </tr>
              <tr>
                <td>{fs.reqAlt}</td> {/* block 24 */}
              </tr>
              </tbody>
            </table>
          </td>
          <td style={rootTdStyle}>
            <table style={{width: "180px", textAlign: "left", paddingLeft: "10px"}}>
              <tbody>
              <tr>
                <td style={{paddingBottom: "70px", overflowWrap: 'anywhere'}}>{fs.route}</td> {/* block 25 */}
              </tr>
              <tr>
                <td>{fs.remarks}</td> {/* block 26 */}
              </tr>
              </tbody>
            </table>
          </td>
          <td>
            <table style={{width: "100px", textAlign: "left", paddingLeft: "10px"}}>
              <tbody>
              <tr>
                <td>{fs.squawk}</td> {/* block 27 */}
              </tr>
              <tr>
                <td style={{paddingBottom: "50px"}}>{fs.misc}</td> {/* block 28 */}
              </tr>
              <tr>
                <td>{fs.trans1}</td> {/* block 29 */}
                <td style={{textAlign: "right", paddingLeft: "0px", paddingRight: "10px"}}>{fs.trans2}</td> {/* block 30 */}
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