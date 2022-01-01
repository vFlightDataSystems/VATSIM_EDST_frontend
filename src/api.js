
// const baseurl = 'http://localhost:5000/backend';
const baseurl = 'http://tdls.oakartcc.org/backend';

export async function getEdstData() {
  return await fetch(`${baseurl}/edst/all`);
}

export async function getArtccEdstData(artcc) {
  return await fetch(`${baseurl}/edst/artcc/${artcc}`);
}

export async function getEdstEntry(callsign) {
  return await fetch(`${baseurl}/edst/entry/${callsign}`);
}

export async function updateEdstEntry(plan_data) {
  return await fetch(`${baseurl}/edst/entry/update`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(plan_data)
  });
}

export async function getBoundaryData(artcc) {
  return await fetch(`${baseurl}/edst/boundary_data/${artcc}`);
}
