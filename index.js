const fastify = require("fastify")();
const client = require("cheerio-httpcli");

const URL = "https://www.data-index.co.jp/search/ethicaldrugs_list";
const OTC_URL = "https://www.data-index.co.jp/search/otc_list";

fastify.get("/search", async (req, res) => {
	console.log(`request to:${URL}?drug_name=${req.query.name}`);
	
	const data = await client.fetch(URL, {
		drug_name: req.query.name,
		page_size: 10000
	})
		.then(result => {
			let arr = [];
			let $ = result.$;

			if ($("#ethicaldrugs_list > div.contents > div.mainColumn > div > section > div > dl > dd > span").text() === "検索条件に該当する薬品は見つかりませんでした。") {
					res.send({});
			}
			
			$("#ethicaldrugs_list > div.contents > div.mainColumn > div > section > div > dl")
			.children()
			.each((i, elem) => {
				let key = (i-i%2)/2;
				console.log(key);
				if (arr[key] === undefined) {
					arr[key] = {};
				};

				if ($(elem).get(0).tagName === "dt") {
					let [_, medicineCode] = $(elem).find(".medicineCode").text().split("：");
					let medicineName = $(elem).find(".medicineName > a").text();

					arr[key].medicineCode = medicineCode;
					arr[key].medicineName = medicineName;
				} else if($(elem).get(0).tagName === "dd") {
					let medicinePrice = $(elem).find("span:nth-child(5) > div").eq(1).text();
					let medicineMaker = $(elem).find("span:nth-child(6) > div").eq(1).text();

					arr[key].medicinePrice = parseFloat(medicinePrice);
					arr[key].medicineMaker = medicineMaker;
				}
			});
			return arr;
		})
		.catch(err => console.error(err));
		
		res.send(data);
	});


	fastify.get("/search_otc", async (req,res) => {
		console.log(`request to:${OTC_URL}?shohin=${req.query.name}`);
	
		const data = await client.fetch(OTC_URL, {
			shohin: req.query.name,
			limit: 10000
		})
			.then(result => {
				let arr = [];
				let $ = result.$;

				if ($("#otc_list > div.contents > div.mainColumn > div > section > div > dl > dd > span").text() === "検索条件に該当する薬品は見つかりませんでした。") {
					res.send({});
				}
				
				$("#otc_list > div.contents > div.mainColumn > div > section > div > dl")
				.children()
				.each((i, elem) => {
					let key = (i-i%2)/2;
					if (arr[key] === undefined) {
						arr[key] = {};
					};
					if ($(elem).get(0).tagName === "dt") {
						let medicineCode = $(elem).find(".medicineName > a").url().replace("https://www.data-index.co.jp/search/otc_detail?touroku_code=", "").replace(/\&competition\_code=[A-Z]/g, "").replace("&search_page=otc", "");
						let medicineName = $(elem).find(".medicineName > a").text();
						
						arr[key].medicineCode = medicineCode;
						arr[key].medicineName = medicineName;
					} else if ($(elem).get(0).tagName === "dd") {
						let medicineMaker = $(elem).find("span:nth-child(1) > div:nth-child(2)").text().replace(/\s+/g, "");
						
						arr[key].medicineMaker = medicineMaker;
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
