/* ==========================================================================
   PREMIUM TRANSFER — Shared booking widget
   Single source of truth for the quick-booking form used on the homepage
   and on split-airport-transfers.html (and any future page). The markup
   lives in partials/booking-widget.html; this file fetches it into
   <div id="booking-widget-mount"></div> and wires up all interactivity.
   Depends on js/pricing.js (VEHICLES, DESTINATION_NAMES, calculateTotal,
   formatEUR, vehiclesForPassengers) being loaded first.
   ========================================================================== */

let currentTrip = 'oneway';
let currentVehicle = 'skoda';
let currentDistanceKm = null;   // real driving distance once resolved — the only thing pricing depends on now
let distanceService = null;     // lazy-created google.maps.DistanceMatrixService instance

function setTripType(type){
  currentTrip = type;
  document.getElementById('trip-oneway').classList.toggle('active', type==='oneway');
  document.getElementById('trip-return').classList.toggle('active', type==='return');
  document.getElementById('b-trip-type').value = type;
  const isReturn = type === 'return';
  document.getElementById('return-fields-row').style.display = isReturn ? 'grid' : 'none';
  document.getElementById('trip-details-legend').textContent = isReturn ? 'Outbound & Return' : 'Trip Details';
  document.getElementById('b-date-label').textContent = isReturn ? 'Outbound Date' : 'Date';
  document.getElementById('b-time-label').textContent = isReturn ? 'Outbound Time' : 'Time';
  const rd = document.getElementById('b-return-date'), rt = document.getElementById('b-return-time');
  if(isReturn){ rd.setAttribute('required',''); rt.setAttribute('required',''); }
  else { rd.removeAttribute('required'); rt.removeAttribute('required'); rd.value=''; rt.value=''; }
  updateSummary();
}

function selectVehicle(key){
  const opt = document.getElementById('vopt-' + key);
  if(opt.classList.contains('disabled')) return;
  currentVehicle = key;
  document.querySelectorAll('.vehicle-opt').forEach(el => el.classList.remove('active'));
  opt.classList.add('active');
  document.getElementById('b-vehicle').value = key;
  updateSummary();
}

function onPaxChange(){
  const pax = parseInt(document.getElementById('b-pax').value, 10);
  const eligible = vehiclesForPassengers(pax);
  Object.keys(VEHICLES).forEach(key => {
    const opt = document.getElementById('vopt-' + key);
    if(eligible.includes(key)){
      opt.classList.remove('disabled');
    } else {
      opt.classList.add('disabled');
      opt.classList.remove('active');
    }
  });
  if(!eligible.includes(currentVehicle)){
    currentVehicle = eligible[0];
    document.getElementById('b-vehicle').value = currentVehicle || '';
    document.querySelectorAll('.vehicle-opt').forEach(el => el.classList.remove('active'));
    if(currentVehicle) document.getElementById('vopt-' + currentVehicle).classList.add('active');
  }
  updateSummary();
}

/**
 * Recomputes and re-renders everything from current state: same-address
 * check, tiered price (via pricing.js calculateTotal), the live price bar,
 * the sidebar summary, the trip-summary card, and the hidden Netlify Forms
 * fields that carry the quoted price/distance through to the driver.
 */
function updateSummary(){
  const pax = document.getElementById('b-pax').value;
  const isReturn = currentTrip === 'return';
  const pickupText = document.getElementById('b-pickup').value.trim();
  const dropoffText = document.getElementById('b-dropoff').value.trim();

  const sameAddress = pickupText && dropoffText && pickupText.toLowerCase() === dropoffText.toLowerCase();
  document.getElementById('address-error').style.display = sameAddress ? 'block' : 'none';

  const bothEntered = pickupText.length > 0 && dropoffText.length > 0;

  const total = (!sameAddress && currentDistanceKm != null)
    ? calculateTotal(currentDistanceKm, currentVehicle, currentTrip)
    : null;

  // state: 'empty' (nothing entered yet), 'priced' (distance resolved), 'unpriced' (entered but no distance yet / same address)
  let state;
  if(!bothEntered){
    state = 'empty';
  } else if(total === null){
    state = 'unpriced';
  } else {
    state = 'priced';
  }

  // --- Live price bar, directly above the Book Now button ---
  document.getElementById('live-price-loading').style.display = 'none';
  document.getElementById('live-price-empty').style.display = state === 'empty' ? 'block' : 'none';
  document.getElementById('live-price-priced').style.display = state === 'priced' ? 'flex' : 'none';
  document.getElementById('live-price-unpriced').style.display = state === 'unpriced' ? 'block' : 'none';
  if(state === 'priced'){
    document.getElementById('live-price-total').textContent = formatEUR(total);
    document.getElementById('live-price-trip').textContent = isReturn ? '(return)' : '(one way)';
  }

  // --- Sidebar price summary ---
  document.getElementById('summary-empty').style.display = state === 'empty' ? 'block' : 'none';
  document.getElementById('summary-priced').style.display = state === 'priced' ? 'block' : 'none';
  document.getElementById('summary-unpriced').style.display = state === 'unpriced' ? 'block' : 'none';
  document.getElementById('summary-box').classList.toggle('is-empty', state === 'empty');
  if(state === 'priced'){
    document.getElementById('sum-route').textContent = pickupText + ' → ' + dropoffText;
    document.getElementById('sum-trip').textContent = isReturn ? 'Return' : 'One way';
    document.getElementById('sum-vehicle').textContent = VEHICLES[currentVehicle] ? VEHICLES[currentVehicle].name : '—';
    document.getElementById('sum-pax').textContent = pax;
    document.getElementById('sum-total').textContent = formatEUR(total);
    document.getElementById('sum-note').textContent = isReturn
      ? 'Return fare — includes an automatic 5% discount on the total price.'
      : `${currentDistanceKm.toFixed(1)} km · fixed price, all-inclusive.`;
  }

  // --- Hidden fields so the real Netlify Forms submission carries the quote ---
  document.getElementById('b-distance-km').value = currentDistanceKm != null ? currentDistanceKm.toFixed(1) : '';
  document.getElementById('b-calculated-price').value = total != null ? total : '';

  const waNumbers = {skoda:'385917856056', vclass:'385955482972', trafic:'385955482972'};
  const waBtn = document.getElementById('wa-btn');
  if(waBtn && waNumbers[currentVehicle]) waBtn.href = 'https://wa.me/' + waNumbers[currentVehicle];

  const date = document.getElementById('b-date').value;
  const time = document.getElementById('b-time').value;
  const rDate = document.getElementById('b-return-date').value;
  const rTime = document.getElementById('b-return-time').value;
  document.getElementById('ts-route').textContent = (pickupText || '—') + ' → ' + (dropoffText || '—');
  document.getElementById('ts-trip').textContent = isReturn ? 'Return' : 'One way';
  document.getElementById('ts-outbound').textContent = (date || '—') + (time ? ' at ' + time : '');
  document.getElementById('ts-pax').textContent = pax;
  document.getElementById('ts-return-row').style.display = isReturn ? 'flex' : 'none';
  if(isReturn){
    document.getElementById('ts-return').textContent = (rDate || '—') + (rTime ? ' at ' + rTime : '');
  }
}

function showTripSummary(){
  document.getElementById('trip-summary-view').style.display = 'block';
  document.getElementById('trip-edit-view').style.display = 'none';
}
function showTripEdit(){
  document.getElementById('trip-summary-view').style.display = 'none';
  document.getElementById('trip-edit-view').style.display = 'block';
}

/** Swaps pickup and dropoff — text and hidden lat/lng together. Distance is symmetric, so it stays valid. */
function swapAddresses(){
  const pickupInput = document.getElementById('b-pickup');
  const dropoffInput = document.getElementById('b-dropoff');
  const pLat = document.getElementById('b-pickup-lat'), pLng = document.getElementById('b-pickup-lng');
  const dLat = document.getElementById('b-dropoff-lat'), dLng = document.getElementById('b-dropoff-lng');

  const tmpText = pickupInput.value; pickupInput.value = dropoffInput.value; dropoffInput.value = tmpText;
  const tmpLat = pLat.value; pLat.value = dLat.value; dLat.value = tmpLat;
  const tmpLng = pLng.value; pLng.value = dLng.value; dLng.value = tmpLng;

  updateSummary();
}

/**
 * Initializes Google Places Autocomplete on the pickup/dropoff fields.
 * Called by the Google Maps script's callback once it has loaded.
 * Restricted to Croatia. Selecting a suggestion fills the field with a
 * clean formatted address and immediately kicks off a real distance lookup.
 */
// For most addresses place.formatted_address is already a good, specific
// display value. But for large natural-feature POIs (national parks,
// lakes, mountains...) Google often has no street-level address for it and
// formatted_address collapses to just the country (e.g. "Hrvatska") —
// silently dropping the place name itself. Prepending place.name whenever
// it isn't already part of the address keeps those cases readable, e.g.
// "Nacionalni park Krka, Hrvatska" instead of a bare "Hrvatska".
function placeDisplayValue(place){
  if(!place) return '';
  const name = (place.name || '').trim();
  const address = (place.formatted_address || '').trim();
  if(name && address && !address.toLowerCase().includes(name.toLowerCase())){
    return name + ', ' + address;
  }
  return address || name || '';
}

function initPlacesAutocomplete(){
  if(typeof google === 'undefined' || !google.maps || !google.maps.places) return;

  const pickupInput = document.getElementById('b-pickup');
  const dropoffInput = document.getElementById('b-dropoff');
  const options = { componentRestrictions: { country: 'hr' }, fields: ['geometry', 'formatted_address', 'name'] };

  const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, options);
  pickupAutocomplete.addListener('place_changed', () => {
    const place = pickupAutocomplete.getPlace();
    const display = placeDisplayValue(place);
    if(display) pickupInput.value = display;
    if(place && place.geometry && place.geometry.location){
      document.getElementById('b-pickup-lat').value = place.geometry.location.lat();
      document.getElementById('b-pickup-lng').value = place.geometry.location.lng();
    }
    maybeFetchDistance();
  });

  const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, options);
  dropoffAutocomplete.addListener('place_changed', () => {
    const place = dropoffAutocomplete.getPlace();
    const display = placeDisplayValue(place);
    if(display) dropoffInput.value = display;
    if(place && place.geometry && place.geometry.location){
      document.getElementById('b-dropoff-lat').value = place.geometry.location.lat();
      document.getElementById('b-dropoff-lng').value = place.geometry.location.lng();
    }
    maybeFetchDistance();
  });

  // Maps just became ready — if a route was already typed/prefilled before
  // this finished loading (e.g. the ?to= deep-link case), the earlier
  // maybeFetchDistance() call would have silently no-opped on google.maps
  // being undefined with no retry. Give it one more shot now.
  maybeFetchDistance();
}
// If the Google Maps script hasn't loaded yet (or the API key isn't set), this
// callback simply never fires — the fields still work as plain text inputs,
// they just won't show autocomplete suggestions. The distance lookup below
// still works from the typed address text directly in that case.

let distanceFetchTimer = null;
let lastDistanceFetchKey = '';

/** Debounced trigger — called on every keystroke and after every Places selection. */
function maybeFetchDistance(){
  clearTimeout(distanceFetchTimer);
  distanceFetchTimer = setTimeout(() => {
    const pickupText = document.getElementById('b-pickup').value.trim();
    const dropoffText = document.getElementById('b-dropoff').value.trim();
    if(!pickupText || !dropoffText) return;
    if(pickupText.toLowerCase() === dropoffText.toLowerCase()) return; // same-address guard handles this in updateSummary
    const key = pickupText.toLowerCase() + '|' + dropoffText.toLowerCase();
    if(key === lastDistanceFetchKey && currentDistanceKm != null) return; // avoid refetching the same pair
    lastDistanceFetchKey = key;
    fetchDistance(pickupText, dropoffText);
  }, 600);
}

/**
 * Real driving distance via google.maps.DistanceMatrixService — the
 * browser-safe client library. (The raw REST distancematrix/routes
 * endpoints do not support CORS from the browser and fail silently there,
 * which is why this uses the JS library instead.) It geocodes the typed
 * address text itself, so this works whether or not a Places suggestion
 * was explicitly clicked.
 */
function fetchDistance(pickupText, dropoffText){
  if(typeof google === 'undefined' || !google.maps){
    console.warn('Google Maps not loaded — cannot calculate distance.');
    return;
  }
  document.getElementById('live-price-empty').style.display = 'none';
  document.getElementById('live-price-priced').style.display = 'none';
  document.getElementById('live-price-unpriced').style.display = 'none';
  document.getElementById('live-price-loading').style.display = 'block';

  if(!distanceService) distanceService = new google.maps.DistanceMatrixService();

  distanceService.getDistanceMatrix({
    origins: [pickupText],
    destinations: [dropoffText],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC
  }, (response, status) => {
    if(status !== 'OK'){
      console.warn('DistanceMatrixService failed:', status);
      currentDistanceKm = null;
      updateSummary();
      return;
    }
    const element = response && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0];
    if(!element || element.status !== 'OK'){
      console.warn('No driving route found between these addresses.');
      currentDistanceKm = null;
      updateSummary();
      return;
    }
    currentDistanceKm = element.distance.value / 1000;
    updateSummary();
  });
}

// GA4 key event, fired once the booking form has actually been accepted by
// Netlify Forms (see the fetch().then() success handler in submitBooking()
// below) — never on a failed/pending submission. Pushed as a plain object
// with an "event" key, which is the shape a Google Tag Manager container's
// Custom Event trigger listens for on window.dataLayer, so this becomes
// visible in GTM's Preview mode the moment a GTM snippet is added to the
// site. Today there's no GTM container installed here (GA4 loads directly
// via gtag.js — see the consent-gated script in <head>), so gtag() is also
// called directly to actually get the event into GA4 right now. If GTM is
// added later and given its own GA4 event tag on this same dataLayer
// event, drop the direct gtag() call below to avoid double-counting.
function trackQualifyLead(){
  const params = {
    form_name: 'booking',
    trip_type: (document.getElementById('b-trip-type') || {}).value || 'oneway',
    vehicle: currentVehicle || (document.getElementById('b-vehicle') || {}).value || '',
    passengers: (document.getElementById('b-pax') || {}).value || '',
  };
  const price = parseFloat((document.getElementById('b-calculated-price') || {}).value);
  if(Number.isFinite(price) && price > 0){
    params.value = price;
    params.currency = 'EUR';
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: 'qualify_lead' }, params));
  if(typeof gtag === 'function'){
    gtag('event', 'qualify_lead', params);
  }
}

function submitBooking(e){
  e.preventDefault();
  // Safety net: never submit a vehicle that can't actually fit the entered
  // passengers/suitcases, even if some path failed to keep the hidden
  // b-vehicle field in sync with the visible selection.
  const submitPax = parseInt(document.getElementById('b-pax').value, 10);
  const submitSuitcases = parseInt(document.getElementById('b-suitcases').value, 10);
  const vehicleFits = key => VEHICLES[key] && submitPax >= VEHICLES[key].minPax && submitPax <= VEHICLES[key].maxPax && submitSuitcases <= VEHICLES[key].suitcases;
  if(!vehicleFits(currentVehicle)){
    const fallbackVehicle = Object.keys(VEHICLES).find(vehicleFits);
    if(fallbackVehicle){
      currentVehicle = fallbackVehicle;
      document.getElementById('b-vehicle').value = fallbackVehicle;
    }
  }
  const pickupText = document.getElementById('b-pickup').value.trim();
  const dropoffText = document.getElementById('b-dropoff').value.trim();
  if(pickupText && dropoffText && pickupText.toLowerCase() === dropoffText.toLowerCase()){
    document.getElementById('address-error').style.display = 'block';
    document.getElementById('b-dropoff').focus();
    return false;
  }
  const form = document.getElementById('booking-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString()
  })
    .then((response) => {
      // fetch() only rejects on a network-level failure — an HTTP error
      // status (e.g. Netlify rejecting a spam-flagged or malformed
      // submission) still resolves this .then(), so without this check
      // both the success UI and the qualify_lead tracking below would fire
      // on a submission that was never actually recorded.
      if(!response.ok){
        throw new Error('Netlify Forms submission failed with status ' + response.status);
      }
      form.style.display = 'none';
      trackQualifyLead();
      // Copy the already-computed trip summary into the success card — same
      // values updateSummary() keeps in the sidebar, no recalculation. Only
      // shown if a price actually resolved; otherwise there's nothing
      // reliable to copy, so the trip summary block stays hidden.
      const wasPriced = document.getElementById('summary-priced').style.display === 'block';
      document.querySelector('.success-summary').style.display = wasPriced ? 'block' : 'none';
      if(wasPriced){
        const copyText = (fromId, toId) => {
          document.getElementById(toId).textContent = document.getElementById(fromId).textContent;
        };
        copyText('sum-route', 'succ-route');
        copyText('sum-trip', 'succ-trip');
        copyText('sum-vehicle', 'succ-vehicle');
        copyText('sum-pax', 'succ-pax');
        copyText('sum-total', 'succ-total');
      }
      document.getElementById('summary-box').style.display = 'none';
      document.getElementById('booking-confirm').classList.add('show');
      document.getElementById('booking-confirm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .catch((error) => {
      alert('Something went wrong sending your booking. Please try again or contact us on WhatsApp.');
      console.error(error);
    })
    .finally(() => {
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Book Now'; }
    });
  return false;
}

// Prefill from query params (?to=&pax=&date=&time=&vehicle=&trip=&return_date=&return_time=)
// so links from Fleet/Destinations pages land here with details already filled in.
// The destination name is filled in as plain text — the real price still comes
// from an actual DistanceMatrixService lookup, same as manually typed addresses.
// Runs once the widget markup has actually been injected into the page (see
// initBookingWidget below) rather than on DOMContentLoaded, since the fields
// it reads don't exist until then.
// The time fields are <select>s on a 15-minute grid now. A link can still
// carry any time (e.g. ?time=10:37), and assigning a value a <select> has no
// option for silently leaves it empty — so add the option rather than lose it.
function setTimeValue(id, value){
  const el = document.getElementById(id);
  if(!el || !value) return;
  if(el.tagName === 'SELECT' && !Array.from(el.options).some(o => o.value === value)){
    const opt = document.createElement('option');
    opt.value = value; opt.textContent = value;
    el.appendChild(opt);
  }
  el.value = value;
}

function runBookingPrefill(){
  const params = new URLSearchParams(window.location.search);
  let gotEnough = false;
  const toKey = params.get('to');
  if(toKey && DESTINATION_NAMES[toKey]){
    document.getElementById('b-dropoff').value = DESTINATION_NAMES[toKey];
    document.getElementById('b-pickup').value = 'Split Airport (SPU), Croatia';
    gotEnough = true;
  }
  if(params.get('date')) document.getElementById('b-date').value = params.get('date');
  if(params.get('time')) setTimeValue('b-time', params.get('time'));
  if(params.get('pax')) document.getElementById('b-pax').value = params.get('pax');
  if(params.get('vehicle')) currentVehicle = params.get('vehicle');
  if(params.get('trip') === 'return'){
    setTripType('return');
    if(params.get('return_date')) document.getElementById('b-return-date').value = params.get('return_date');
    if(params.get('return_time')) setTimeValue('b-return-time', params.get('return_time'));
  }
  onPaxChange();
  if(currentVehicle) {
    document.querySelectorAll('.vehicle-opt').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('vopt-' + currentVehicle);
    if(el && !el.classList.contains('disabled')) el.classList.add('active');
  }
  updateSummary();

  if(gotEnough){
    if(window.loadGoogleMaps) window.loadGoogleMaps(); // no field interaction to trigger this otherwise
    maybeFetchDistance(); // resolve the real price for the pre-filled route too
  }

  if(gotEnough && params.get('date') && params.get('time')){
    showTripSummary();
  } else {
    showTripEdit();
  }

  // Re-validate and re-fetch distance on every keystroke in either field
  document.getElementById('b-pickup').addEventListener('input', () => { updateSummary(); maybeFetchDistance(); });
  document.getElementById('b-dropoff').addEventListener('input', () => { updateSummary(); maybeFetchDistance(); });
}

// --- Lazy-load Google Maps (Places + Distance Matrix) ---------------------
// This is the single heaviest script on the page (300KB+ of mostly-unused
// JS for any visitor who never touches the address fields) — a blind
// setTimeout fallback used to force-load it a few seconds after every page
// load "just in case", but that meant it always fired for automated,
// non-interactive visits (Lighthouse/PageSpeed included), tanking Total
// Blocking Time for every single audit. Load only on genuine interaction
// with the address fields or first scroll; window.loadGoogleMaps is also
// exposed so the `?to=` deep-link prefill (above) can request it
// immediately for the one real case where a price is needed with no
// interaction at all.
let mapsRequested = false;
function loadGoogleMaps(){
  if(mapsRequested) return;
  mapsRequested = true;
  const s = document.createElement('script');
  s.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDgQJm5_D91Uds885A759nlnbZZbNzZ7jo&libraries=places&loading=async&callback=initPlacesAutocomplete';
  s.async = true;
  document.head.appendChild(s);
}
window.loadGoogleMaps = loadGoogleMaps;
// First scroll is a reasonable signal the visitor is engaging with the page.
// Safe to attach immediately — doesn't depend on the widget markup existing yet.
window.addEventListener('scroll', loadGoogleMaps, {once: true, passive: true});

/** Attaches the field-interaction Maps triggers — needs the widget markup to already be in the DOM. */
function attachLazyMapsTriggers(){
  ['focus', 'touchstart', 'mousedown'].forEach(function(evt){
    const pu = document.getElementById('b-pickup');
    const doff = document.getElementById('b-dropoff');
    if(pu) pu.addEventListener(evt, loadGoogleMaps, {once: true, passive: true});
    if(doff) doff.addEventListener(evt, loadGoogleMaps, {once: true, passive: true});
  });
}

/** Runs once the widget's real markup has just been injected into the mount point. */
function initBookingWidget(){
  runBookingPrefill();
  attachLazyMapsTriggers();
}

// --- Load the shared widget markup into whichever page has a mount point ---
(function(){
  const mount = document.getElementById('booking-widget-mount');
  if(!mount) return;
  fetch('partials/booking-widget.html')
    .then(function(response){ return response.text(); })
    .then(function(html){
      mount.innerHTML = html;
      // Release the CSS height reservation now that the real form occupies
      // the space it was holding open.
      mount.classList.add('is-loaded');
      initBookingWidget();
    })
    .catch(function(err){
      console.error('Failed to load booking widget:', err);
    });
})();
