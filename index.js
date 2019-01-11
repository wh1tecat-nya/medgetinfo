const fastify = require("fastify")();
const client = require("cheerio-httpcli");

const url = "https://www.data-index.co.jp/search/ethicaldrugs_list";

fastify.get("/search", async (req, res) => {
	console.log(`request to:${url}?drug_name=${req.query.name}`);
	
	const data = await client.fetch(url, {drug_name: req.query.name})
		.then(result => {
			let arr = [];
			let $ = result.$;
			$("#ethicaldrugs_list > div.contents > div.mainColumn > div > section > div > dl")
			.children()
			.each((i, elem) => {
				let key = (i-i%2)/2;
				if (arr[key] === undefined) {
					arr[key] = {};
				};

				if ($(elem).get(0).tagName == "dt") {
					let [_,medicineCode] = $(elem).find(".medicineCode").text().split("：");
					let medicineName = $(elem).find(".medicineName > a").text();

					arr[key].medicineCode = medicineCode;
					arr[key].medicineName = medicineName;
				} else if($(elem).get(0).tagName == "dd") {
					let spanChild = $(elem).find("span:nth-child(5) > div");
					let medicinePrice = spanChild.eq(1).text();

					arr[key].medicinePrice = medicinePrice;
				}
			});
			return arr;
		})
		.catch(err => console.error(err));
		
		res.send(data);
	});


	fastify.listen(3003)
	.then(address => {console.log(`Server listening on ${address}`)})
	.catch(err => {
		console.error(`Error starting server: ${err}`);
		process.exit(1);
	}); 
