
let ipAdd = window.localStorage.getItem('ip');

// ********************************************* //

const ipAddressEl = document.getElementById('ip');
const latitudeEl = document.getElementById('latitude');
const longitudeEl = document.getElementById('longitude');
const cityEl = document.getElementById('cityName');
const regionEl = document.getElementById('regionName');
const organisationEl = document.getElementById('orgName');
const hostEl = document.getElementById('hostName');
const timeZoneEl = document.getElementById('time-zone');
const dateTimeEl = document.getElementById('date-time');
const pinCodeEl = document.getElementById('pincode');
const messageEl = document.getElementById('message');
const searchBoxInputEl = document.getElementById('search-box');
const mapDisplayEl = document.getElementById('map-display');
const displayPostOfficesDiv = document.getElementById('details-tile-flex');
ipAddressEl.textContent = ipAdd;

// **************************************************** //

function dispMap(latitude, longitude) {
  let html = `
  <iframe 
  src="https://maps.google.com/maps?q=${latitude}, ${longitude}&output=embed" 
  width="100%" 
  height="100%" 
  frameborder="0" 
  style="border:0">
  </iframe>
  `
  mapDisplayEl.innerHTML = html;
}

// ***************************************************** //

function dispPostOff(post_office_name, post_office_branch, post_office_delivery, post_office_district, post_office_division) {
  let html = `
  <div class="details-tiles ${post_office_name.toLowerCase()} ${post_office_branch.toLowerCase()}">
    <p class="details">Name: <span id="post_office_name">${post_office_name}</span> </p>
    <p class="details">Branch Type: <span id="post_office_branch">${post_office_branch}</span></p>
    <p class="details">Delivery Status: <span id="post_office_delivery">${post_office_delivery}</span></p>
    <p class="details">District: <span id="post_office_district">${post_office_district}</span></p>
    <p class="details">Division: <span id="post_office_division">${post_office_division}</span></p>
  </div>
  `
  displayPostOfficesDiv.insertAdjacentHTML('beforeend', html);
}

// ***************************************************** //

fetch(`https://ipinfo.io/${ipAdd}/geo?token=12e4a7b96dca7c`)
  .then(response => response.json())
  .then((data) => {
    [lat, long] = data.loc.split(',');
    latitudeEl.textContent = lat;
    longitudeEl.textContent = long;
    cityEl.textContent = data.city;
    regionEl.textContent = data.region;
    organisationEl.textContent = data.org;
    hostEl.textContent = `There is no 'host' property given in the object`
    dispMap(lat, long);
    timeZoneEl.textContent = data.timezone;
    dateTimeEl.textContent = new Date().toLocaleString("en-US", { timeZone: `${data.timezone}` });
    pinCodeEl.textContent = data.postal;
    return data.postal;
  })
  .then((pin) => {
    let pinCode = pin;
    fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
      .then(response => response.json())
      .then((postalDataArray) => {
        // Storing all post offices present in that pin code in an array
        let postalData = postalDataArray[0];
        messageEl.textContent = postalData.Message;
        let postOfficesInPincodeArray = postalData.PostOffice;
        // display post offices present in that pincode
        postOfficesInPincodeArray.forEach(postOffice => {
          dispPostOff(postOffice.Name, postOffice.BranchType, postOffice.DeliveryStatus, postOffice.District, postOffice.Division)
        });
        searchBoxInputEl.classList.remove('hidden');
        
        searchBoxInputEl.addEventListener('input', (e) => {
          e.preventDefault();
          let postOfficeArray = document.querySelectorAll('.details-tiles');
          let searchValue = searchBoxInputEl.value.toLowerCase().trim();
          postOfficeArray.forEach((postOfficeElement) => {
            let name = postOfficeElement.querySelector('#post_office_name').textContent.toLowerCase();
            let branchType = postOfficeElement.querySelector('#post_office_branch').textContent.toLowerCase();
            if (searchValue === '') postOfficeElement.classList.remove('hidden');
            if (!name.includes(searchValue) && !branchType.includes(searchValue)) {
              postOfficeElement.classList.add('hidden');
            } else {
              postOfficeElement.classList.remove('hidden');
            }
          })
        })
      })
      .catch(postalError => {
        console.error(postalError.message);
      })
  })
  .catch((error) => {
    console.error(error.message);
  })
