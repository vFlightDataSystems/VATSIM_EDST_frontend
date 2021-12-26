
const baseurl = 'http://localhost:5000/backend';
// const baseurl = 'http://tdls.oakartcc.org/backend';

export async function getEdstData() {
  return await fetch(`${baseurl}/edst/all`);
}

export async function getEdstEntry(callsign) {
  return await fetch(`${baseurl}/edst/entry/callsign`);
}

export async function updateEdstEntry(data) {
  return await fetch(`${baseurl}/edst/entry/update`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

export async function getRemainingRoute(callsign) {
  return await fetch(`${baseurl}/edst/route/remaining_route/${callsign}`);
}