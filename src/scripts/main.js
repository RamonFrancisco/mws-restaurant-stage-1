let restaurants,
neighborhoods,
cuisines
var map
var markers = []

/**
* Fetch neighborhoods and cuisines as soon as the page is loaded.
*/
document.addEventListener('DOMContentLoaded', (event) => {
	fetchNeighborhoods();
	fetchCuisines();
});

window.addEventListener('load', () => {
	registerServiceWorker();
});

// Register Service Worker
const registerServiceWorker = () => {
	if (!navigator.serviceWorker) return;

	navigator.serviceWorker.register('./sw.js')
	.then(register => console.log(register))
	.catch(err => console.log(err));
};

/**
* Set neighborhoods HTML.
*/
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
}

/**
* Fetch all neighborhoods and set their HTML.
*/
const fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		if (error) { // Got an error
			console.error(error);
		} else {
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		}
	});
}

/**
* Fetch all cuisines and set their HTML.
*/
const fetchCuisines = () => {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
	});
}





/**
* Set cuisines HTML.
*/
const fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');
	
	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
}

/**
* Initialize Google map, called from HTML.
*/
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	self.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
	updateRestaurants();
}

/**
* Update page and map for current restaurants.
*/
const updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');
	
	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;
	
	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;
	
	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	})
}

/**
* Clear current restaurants, their HTML and remove their map markers.
*/
const resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';
	
	// Remove all map markers
	self.markers.forEach(m => m.setMap(null));
	self.markers = [];
	self.restaurants = restaurants;
}

/**
* Create all restaurants HTML and add them to the webpage.
*/
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
}

/**
* Create restaurant HTML.
*/
function createRestaurantHTML (restaurant) {
    console.log(restaurant);
    const li = document.createElement('li');
    li.classList.add('restaurant-item');
	
	const image = document.createElement('img');
	image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = restaurant.name;
	li.append(image);
	
    const name = document.createElement('h3');
    name.className = 'restaurant-name';
	name.innerHTML = restaurant.name;
	li.append(name);
	
    const neighborhood = document.createElement('p');
    neighborhood.className = 'restaurant-text';
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);
	
    const address = document.createElement('p');
    address.className = 'restaurant-text';
	address.innerHTML = restaurant.address;
	li.append(address);
	
    const more = document.createElement('a');
    more.classList.add('restaurant-more');
	more.innerHTML = 'View Details';
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more)
	
	return li
}

/**
* Add markers for current restaurants to the map.
*/
function addMarkersToMap(restaurants = self.restaurants) {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url
		});
		self.markers.push(marker);
	});
}
