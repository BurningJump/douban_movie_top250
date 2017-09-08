var https = require('https')
var cheerio = require('cheerio')
var fs = require('fs')
var request = require('request')
var xlsx = require('node-xlsx');
var start = 0
var url = 'https://movie.douban.com/top250?start=' + start + '&filter='

function filterChapters(html) {
	var $ = cheerio.load(html)
	var chapters = $('div#content')
	/*[{
		chapterTitle: '',
		movies: [
			title: '',
			id: '',
			rank: '',
			rate: ''
		]
	}]*/

	var movieData = []
	chapters.each(function(item) {
		var chapter = $(this)
		var chapterTitle = chapter.find('h1').text()
		var movies = chapter.find('ol.grid_view').children('li')
		var chapterData = {
			chapterTitle: chapterTitle,
			movies: []
		}

		movies.each(function(item) {
			var movie = $(this).find('div.item')
			var movieTitle = movie.find('div.info div.hd span.title:first-child').text().replace(/\s+/g,' ')
			var id = movie.find('a').attr('href').split('https://movie.douban.com/subject/')[1]
			var rank = movie.find('div.pic em').text()
			var rate = movie.find('div.info div.bd div.star span.rating_num').text()

			chapterData.movies.push({
				title: movieTitle,
				id: id,
				rank: rank,
				rate: rate
			})
		})

		movieData.push(chapterData)
	})

	return movieData
}

function printmovieInfo(movieData) {
	movieData.forEach(function(item) {
		var chapterTitle = item.chapterTitle
		//将章节标题写入文件
		item.movies.forEach(function(movie) {

			/*//生成Excel文件
			function writeXls(datas) {
			    var buffer = xlsx.build({worksheets: [
			        {"name": chapterTitle, "data": movies}
			    ]});
			    fs.writeFileSync("Group.csv", buffer, 'binary');
			}
			function parseXls() {
			    var obj = xlsx.parse('myFile.xlsx');
			    console.log(obj);
			}*/
			//生成TXT文件
			fs.appendFile(chapterTitle + '.txt', movie.rank + ' ' + movie.title + ' ' + movie.rate + '\n', 'utf-8', function (err) {
				if (err) {
					console.log(err);
				}
			});
		})
	})

}
for (var i = 0; i < 10; i++) {
	url = 'https://movie.douban.com/top250?start=' + start + '&filter='
	https.get(url, function (res) {
		var html = ''
		res.on('data', function (data) {
			html += data
		})
		res.on('end', function() {
			var movieData = filterChapters(html)

			printmovieInfo(movieData)
		})
	}).on('error', function() {
		console.log('获取课程数据出错！' + i)
	})
	
	start += 25
}