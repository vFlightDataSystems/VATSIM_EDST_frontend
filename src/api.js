
export const baseurl = 'http://localhost:5000/backend';
// const baseurl = 'http://tdls.oakartcc.org/backend';

export async function get_edst_data() {
  return await fetch(`${baseurl}/edst/all`);
}

