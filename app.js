const fs = require('fs')
const http = require('http')
const path = require('path')
const ffmetadata = require('ffmetadata')

let musicList = fs.readdirSync('music_here/');
let json = JSON.parse(fs.readFileSync('json_here/musicstore', { flag: 'r' }).toString());

musicList.forEach((e) => {
    json.playList.forEach((ele) => {
        if (ele.song_name == e.split('_')[0]) {
            let data = {};
            data.artist = ele.singers;
            data.album = ele.album_name;
            data.title = ele.song_name;
            let coverUrl = ele.logo;
            let albumUrl = ele.album_logo;
            let localCoverUrl = 'album/' + data.title + '-cover.jpg';
            let localAlbumUrl = 'album/' + data.title + '-album.jpg';
            let albumStream = fs.createWriteStream(localAlbumUrl);
            let coverStream = fs.createWriteStream(localCoverUrl);
            http.get(coverUrl, function(response) {
                response.on('data', function(d) {
                    coverStream.write(d);
                });
                response.on('end', function() {
                    http.get(albumUrl, function(response) {
                        response.on('data', function(d) {
                            albumStream.write(d);
                        });
                        response.on('end', function() {
                            ffmetadata.write('music_here/' + e, data, { attachments: Array(localCoverUrl, localAlbumUrl), 'id3v2.3': true, }, function(err) {
                                if (err) {
                                    console.log('write ' + data.title + ' failed');
                                    console.log(err)
                                } else {
                                    console.log('write ' + data.title + ' success!');
                                    fs.rename('music_here/' + e, 'music_here/' + data.artist + ' - ' + data.title + '.mp3');
                                }
                            })
                        });
                    });
                });
            });
        }
    })
})