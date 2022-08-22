const ROUTE_FORMAT_EXPRESSIONS = {
  airway: /^[A-Z]{1,2}\d+$/,
  sidStar: /^[A-Z]{3,}\d[A-Z]?$/,
  anyFix: /^[A-Z]{2,5}|[A,Z]{2}\d{3}$/,
  frd: /^[A-Z]{2,5}\d{6}$/,
  latLonDeg: /^\d\d[NS]\d\d\d[EW]$/,
  latLonMin: /^\d{4}[NS]?\/\d{5}[EW]?$/
};

const cleanRoutePattern = /\+|\/(.*?)\s|(\s?)DCT(\s?)|N[0-9]{4}[FAM][0-9]{3,4}/;
function cleanRoute(route: string, dep = "", dest = "") {
  const cleanedRoute = route.slice(0).replace(cleanRoutePattern, "");
  cleanedRoute.replace(new RegExp(`^\\s*${dep}|${dest}\\s*$`), "");
  return cleanedRoute.trim();
}

function matchesAnyRouteSegment(segment: string) {
  return !!segment.match(new RegExp(`(${ROUTE_FORMAT_EXPRESSIONS.airway})|${ROUTE_FORMAT_EXPRESSIONS.sidStar}`));
}

export function formatRoute(route: string, dep = "", dest = "") {
  let formattedRoute = "";
  const routeSegments = cleanRoute(route, dep, dest)
    .replace(/(\.|\s)+/, " ")
    .split(" ");
  let prevIsFix = true;
  let isFix = true;
  routeSegments.forEach(segment => {
    isFix = matchesAnyRouteSegment(segment);
    if (matchesAnyRouteSegment(segment)) {
      formattedRoute += `..${segment}`;
    } else {
      formattedRoute += `.${segment}`;
    }
    prevIsFix = isFix;
  });
  formattedRoute += prevIsFix ? ".." : ".";
  return formattedRoute;
}
