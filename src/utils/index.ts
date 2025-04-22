import { getDistance } from "geolib";
import _ from "lodash";

export function structureName(name: string) {
  return _.startCase(_.toLower(name));
}

export function generateRandomCode() {
  return _.random(100000, 999999).toString();
}

export async function sendResetEmail(email: string, code: string) {
  console.log(`Sending reset code ${code} to ${email}`);
}

export function validateProximity({
  studentLocation,
  sessionLocation,
  radMeter = 100,
}: {
  studentLocation: { latitude: number; longitude: number };
  sessionLocation: { latitude: number; longitude: number };
  radMeter: number;
}) {
  const distance = getDistance(
    {
      latitude: studentLocation.latitude,
      longitude: studentLocation.longitude,
    },
    { latitude: sessionLocation.latitude, longitude: sessionLocation.longitude }
  );

  return distance <= radMeter;
}
