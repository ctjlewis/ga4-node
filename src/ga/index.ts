type HasCookies = {
  cookies: Partial<{
    [key: string]: string;
  }>
};

export interface RequestWithCookies<T extends HasCookies = HasCookies> {
  cookies: T["cookies"];
}

export interface GaEvent {
  name: string;
  params: {
    [key: string]: string;
  };
}

export interface GaArgs {
  req: RequestWithCookies;
  apiSecret?: string;
  measurementId?: string;
}

/**
 * Send the given event items to the Google Analytics 4 data stream associated
 * with the given `GA_MEASUREMENT_ID`.
 *
 * @see https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events
 *
 * @returns The status code of the request.
 */
export const ga = async (
  {
    req,
    apiSecret: api_secret = process.env.GA_API_SECRET,
    measurementId: measurement_id = process.env.GA_MEASUREMENT_ID,
  }: GaArgs,
  ...events: GaEvent[]
) => {
  if (!api_secret) {
    throw new Error("Missing GA_API_SECRET. Supply `apiSecret` arg or set `GA_API_SECRET` env var.");
  }

  if (!measurement_id) {
    throw new Error("Missing GA_MEASUREMENT_ID. Supply `measurementId` arg or set `GA_MEASUREMENT_ID` env var.");
  }

  /**
   * Extract cookies from the request object.
   */
  const { cookies } = req;
  /**
   * Extract the client_id from the request cookies.
   */
  const { _ga: client_id } = cookies;

  if (!client_id) {
    throw new Error("Missing _ga cookie. Ensure the _ga cookie is set on the request.");
  }

  const { status } = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id,
        events,
      })
    }
  );

  return status;
};