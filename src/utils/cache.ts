export const getMongoRouteCachedName = ({
  fromName,
  fromGeo,
  toName,
  toGeo,
}: {
  fromName: string;
  fromGeo: string;
  toName: string;
  toGeo: string;
}) => {
  const [fromLong, fromLat] = fromGeo.split(',');
  const [toLong, toLat] = toGeo.split(',');

  const from = `${fromName}_${parseFloat(fromLong).toFixed(3)}_${parseFloat(
    fromLat
  ).toFixed(3)}`;
  const to = `${toName}_${parseFloat(toLong).toFixed(3)}_${parseFloat(
    toLat
  ).toFixed(3)}`;
  return `${from}-${to}`;
};
