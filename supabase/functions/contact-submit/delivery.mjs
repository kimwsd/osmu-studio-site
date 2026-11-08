// Only retry transient provider errors; callers use the same idempotency key.
export async function sendWithRetry(send, pause = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  let lastError = 'send_failed';
  for (let attempt = 1; attempt <= 3; attempt++) {
    let transient = false;
    try {
      const {data, error} = await send();
      if (data?.id && !error) return {status:'sent', email_id:data.id, attempts:attempt, last_error:null};
      lastError = error?.name || 'send_failed';
      transient = error?.statusCode === 429 || error?.statusCode >= 500;
    } catch { lastError = 'transport_error'; transient = true; }
    if (!transient || attempt === 3) return {status:'failed', attempts:attempt, last_error:lastError};
    await pause(1000 * attempt);
  }
}
