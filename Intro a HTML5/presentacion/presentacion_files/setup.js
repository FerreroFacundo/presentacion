
// tagcloud
[].forEach.call( document.querySelectorAll('[tagcloud]'), function(cloud){
    cloud.innerHTML = '<span>' + cloud.innerHTML.split(/\n/).join('</span> <span>') + '</span>';
    [].forEach.call( cloud.querySelectorAll('span'), function(elem){
        var prctnge = Math.random() * 60 + 140;
        elem.style.fontSize = prctnge + '%';
        elem.style.color = 'hsl('+ Math.random()*360 +', 40%, 50%)'
        elem.classList.add('clouditem')
    });
});


// markdown
[].forEach.call( document.querySelectorAll('[data-markdown]'), function(elem){

    if (!window.Showdown)
        document.write('<script src="https://raw.github.com/github/' +
            'github-flavored-markdown/gh-pages/scripts/showdown.js">\x3C/script>');

    // strip leading whitespace so it isn't evaluated as code
    var md      = elem.textContent.replace(/(^\s+)|(\n\s+)/g,'\n')
        , html    = (new Showdown.converter()).makeHtml(md);

    // here, have sum HTML
    elem.innerHTML = html;

});


// screenshots
function url2png(url,size){
    var api_key = "P4EA9CF92E4F9C";
    var private_key = "S6DF6D2F1A4204";

    url = url.trim()

    var token = md5("" + private_key + '+' + url);

    size = size || "s1024x768-t500x500";

    return "http://api.url2png.com/v4/" + [api_key, token, size, url].join('/');
}
// screenshots
[].forEach.call( document.querySelectorAll('a[screenshot]'), function(elem){
    var img = document.createElement('img');
    img.src = url2png(elem.href, elem.getAttribute('screenshot'));
    elem.appendChild(img);
});


window.addEventListener('click', function(e){
    if (e.target.nodeName == 'A'){
        e.target.target = '_blank';
    }
});
