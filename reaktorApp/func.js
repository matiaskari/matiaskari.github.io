
var apiURL = "https://bad-api-assignment.reaktor.com";
var proxyURL = "https://cors-anywhere.herokuapp.com/";

var productlistURL = '/v2/products/';
var availabilityURL = '/v2/availability/';

var listHTML = document.getElementById('list');
var dropdownMenu = '<select id="dropdown" onchange="chooseProduct(this.value)">' +
    '<option value="">Choose a product category:</option>' +
    '<option value="0">Gloves</option>' +
    '<option value="1">Facemasks</option>' +
    '<option value="2">Beanies</option></select>';

var productData;
var availabilityData;

function loadData() {
    listHTML.innerHTML = "<h3>Loading, please wait...</h3>"; //Not showing the dropdown menu at all before all data is loaded in so the end user can't try to get data before it has been loaded in

    let manufacturerURLs = [];
    let productURLs = [(proxyURL + apiURL + productlistURL + "gloves"),
    (proxyURL + apiURL + productlistURL + "facemasks"),
    (proxyURL + apiURL + productlistURL + "beanies")];

    Promise.all(productURLs.map(url => fetch(url) //Fetching the product data from all 3 categories
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        }).catch(err => {
            console.error(err);
            listHTML.innerHTML = "Failed to load data, please refresh the page or try again later";
        }))).then(products => {
            productData = products;
            console.log("Product data fetched");
            return productData;
        }).then(item => { //Finding all manufacturers that appear in any of the 3 product categories
            let manufacturers = [];
            for (x in item) {
                manufacturers.push(item[x].map(maker => maker.manufacturer).filter((value, index, self) => self.indexOf(value) === index));
            }
            var merged = [].concat.apply([], manufacturers).filter((value, index, self) => self.indexOf(value) === index); //Making an array that only contains the manufacturer names once
            return merged;
        }).then(makers => {
            for (x in makers) {
                manufacturerURLs.push(proxyURL + apiURL + availabilityURL + makers[x]); //Generating URLs to fetch all manufacturer data
            }
            console.log("Manufacturer URLs generated");
            return manufacturerURLs;
        }).then(data => getAvailabilityData(data))
        .catch(err => console.error(err));
}

function getAvailabilityData(manuURLs) {
    Promise.all(manuURLs.map(url => fetch(url) //Fetching all manufacturer data from manufacturers that appeared at least once in any product data
        .then(response => response.json())
        .catch(err => {
            console.error(err);
            listHTML.innerHTML = "Failed to load data, please refresh the page or try again later";
        }))).then(manufacturers => { //Creating an array that contains all availability data
            console.log(manufacturers);
            let mergedManufacturers = [].concat.apply([], manufacturers).map(x => x.response);
            let mergedAvailabilityData = [].concat.apply([], mergedManufacturers).filter(x => x != "[]");
            console.log("Availability data fetched");
            listHTML.innerHTML = "<h3>Ready to choose category</h3>" + "<br>" + dropdownMenu; //Once all data has been fetched, showing the dropdown menu to the end user
            availabilityData = mergedAvailabilityData;
        }).catch(error => error.serverGetSearchError);
}

function chooseProduct(categoryIndex) { //This function is called by the dropdown menu and given the product category index as a parameter
    if (categoryIndex) {
        listHTML.innerHTML = "<h3>Finding products...</h3>";
        displayData(availabilityData, categoryIndex);
    } else {
        listHTML.innerHTML = "<h3>Choose a product category</h3>";
    }
}

function displayData(availabilityData, categoryIndex) {
    let categories = ["Gloves", "Facemasks", "Beanies"];
    let products = productData[categoryIndex]; //Using products from only the chosen category

    //Generating the HTML table to show the data
    var text = "<table border='1' frame='void' rules='rows'><tr><th>Name</th><th>Color</th><th>Price</th><th>Manufacturer</th><th>Availability</th></tr>"
    for (n = 0; n < products.length; n++) { //Looking at one product at a time
        listHTML.innerHTML = "<h3>Getting products: " + (n + 1) + "/" + products.length + "</h3>";
        let findAvailableID = availabilityData.filter(x => x.id.toString() === products[n].id.toString().toUpperCase()); //Matching the specific product with the availability data that has the same ID
        if (findAvailableID.length > 0) { //If a matching ID was found
            text += "<tr>";
            text += "<td>" + products[n].name.toString() + "</td>";
            if (products[n].color.length == 1) { //Most products have only 1 color, avoiding having to use a for loop if possible, to decrease loading times
                text += "<td>" + products[n].color.toString().charAt(0).toUpperCase() + products[n].color.toString().slice(1) + "</td>";
            } else {
                text += "<td>"
                for (x in products[n].color) {
                    if (x != products[n].color.length - 1) { //Adding a comma between the colors
                        text += products[n].color[x].toString().charAt(0).toUpperCase() + products[n].color[x].toString().slice(1) + ", "; //Making the first letter uppercase
                    } else {
                        text += products[n].color[x].toString().charAt(0).toUpperCase() + products[n].color[x].toString().slice(1);
                    }
                }
                text += "</td>"
            }
            text += "<td>" + products[n].price.toString() + "&euro;</td>";
            text += "<td>" + products[n].manufacturer.toString().charAt(0).toUpperCase() + products[n].manufacturer.toString().slice(1) + "</td>"; //Making the first letter uppercase
            if (findAvailableID[0].DATAPAYLOAD.toString() === "<AVAILABILITY>\n  <CODE>200</CODE>\n  <INSTOCKVALUE>INSTOCK</INSTOCKVALUE>\n</AVAILABILITY>") {
                text += '<td class="greenCell">Available</td>';
            } else if (findAvailableID[0].DATAPAYLOAD.toString() === "<AVAILABILITY>\n  <CODE>200</CODE>\n  <INSTOCKVALUE>LESSTHAN10</INSTOCKVALUE>\n</AVAILABILITY>") {
                text += '<td class="yellowCell">Less than 10</td>';
            } else if (findAvailableID[0].DATAPAYLOAD.toString() === "<AVAILABILITY>\n  <CODE>200</CODE>\n  <INSTOCKVALUE>OUTOFSTOCK</INSTOCKVALUE>\n</AVAILABILITY>") {
                text += '<td class="redCell">Unavailable</td>';
            } else {
                text += "<td>No data</td>";
            }
            text += "</tr>";
        }
    }
    text += "</table>"
    listHTML.innerHTML = dropdownMenu + "<br><h3>" + categories[categoryIndex] + "</h3>" + text; //After generating the table, showing it to the user, along with the dropdown menu
}





//Example product data
/*
[
    {
        "id": "a248ed63d2598c6eedceacc9",
        "type": "gloves",
        "name": "HEMDAL RAIN",
        "color": [
            "purple"
        ],
        "price": 86,
        "manufacturer": "hennex"
    },
    {
        "id": "f766297eff58dbb06da461c",
        "type": "gloves",
        "name": "KOLUP ALPINE LIGHT",
        "color": [
            "grey"
        ],
        "price": 45,
        "manufacturer": "hennex"
    }
]
*/

//Example availability data
/*
{
    "code": 200,
        "response": [
            {
                "id": "50CA669520ABB25C5F9",
                "DATAPAYLOAD": "<AVAILABILITY>\n  <CODE>200</CODE>\n  <INSTOCKVALUE>INSTOCK</INSTOCKVALUE>\n</AVAILABILITY>"
            },
            {
                "id": "2CD129BC0C4BE590A6BD6",
                "DATAPAYLOAD": "<AVAILABILITY>\n  <CODE>200</CODE>\n  <INSTOCKVALUE>INSTOCK</INSTOCKVALUE>\n</AVAILABILITY>"
            }
        ]
}
*/