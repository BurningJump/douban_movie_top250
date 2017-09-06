var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
// 初始化url
var url = "https://movie.douban.com/top250";

function fetchPage(x) {
	startRequest(x);
}

function startRequest(x) {
	//采用http模块箱服务器发起一次get请求
	http.get(x, function (res) {
		//用来存储请求网页的整个HTML内容
		var html = '';
		var titles = [];
		//防止中文乱码
		res.setEncoding('utf-8');
		//监听data时间，每次取一块数据
		res.on('data', function (chunk) {
			html += chunk;
		});
		//监听end事件，如果整个网页内容的HTML都获取完毕，就执行回调函数
		res.on('end', function () {
			//采用cheerio模块解析HTML
			var $ = cheerio.load(html);
			var time = $('.article-info a:first-child').next().text().trim();
			var news_item = {
				//获取文章的标题
				title: $('div.article-title a').text().trim(),
				//获取文章发布的时间
				Time: time,
				//获取当前文章的url
				link: "http://www.ss.pku.edu.cn" + $('div.article-title a').attr('href'),
				//获取供稿单位
				author: $('[title=供稿]').text().trim(),
				//i是用来判断获取了多少篇文章
				i: i = i + 1,
			};

			//打印新闻信息
			console.log(news_item);
			var news_title = $('div.article-title a').text().trim();
			//存储每篇文章的内容及文章标题
			savedContent($, news_title);
			//存储每篇文章的图片及图片标题
			savedImg($, news_title);

			//下一篇文章的url
			var nextLink = "http://www.ss.pku.edu.cn" + $('li.next a').attr('href');
			//去除掉url后面的中文
			str1 = nextLink.split('-');
			str = encodeURL(str1[0]);
			//这是亮点之一，通过控制I，可以控制爬取多少篇文章
			if (i <= 500) {
				fetchPage(str);
			}
		});
	}).on('error', function (err) {
		console.log(err);
	});
}

//该函数的作用：在本地存储所爬取的新闻内容资源
function savedContent($, news_title) {
	$('.article-content p').each(function (index, item) {
		var x = $(this).text();
		var y = x.substring(0, 2).trim();
		if (y == '') {
			x = x +'\n';
			//将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
			fs.appendFile('./data' + news_title + '.txt', x, 'utf-8', function (err) {
				if (err) {
					console.log(err);
				}
			});
		}
	})
}

//在本地存储所爬取的图片资源
function savedImg($, news_title) {
	$('.article-content img').each(function (index, item) {
		//获取图片的标题
		var img_title = $(this).parent().next().text().trim();
		if (img_title.length > 35 || img_title == '') {
			img_title = 'Null';
		}
		var img_filename = img_title + '.jpg';
		//获取图片的url
		var img_src = "http://www.ss.pku.edu.cn" + $(this).attr('src');
		//采用request模块，向服务器发起一次请求，获取图片资源
		request.head(img_src, function (err, res, body) {
			if (err) {
				console,log(err);
			}
		});
		//通过流的方式，把图片写到本地/img目录下，并用新闻的标题和图片的标题作为图片的名称
		request(img_src).pipe(fs.createWriteStream('./img/' + news_title + '---' + img_filename));
	})
}

//主程序开始运行
fetchPage(url);