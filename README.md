# This little tool has been awesomely rendered obsolete and superceeded by [@minhealthnz](https://twitter.com/minhealthnz)'s datafeed at [https://github.com/minhealthnz/nz-covid-data](https://github.com/minhealthnz/nz-covid-data)

## Datasources
- Authoritative feed from Ministry of Health [here](https://www.health.govt.nz/our-work/diseases-and-conditions/covid-19-novel-coronavirus/covid-19-health-advice-public/contact-tracing-covid-19/covid-19-contact-tracing-locations-interest)
- Boundaries [here](https://services5.arcgis.com/cJn6oR1QqErYBL5d/ArcGIS/rest/services/boundaries_view/FeatureServer)
- Alert Level details [here](https://covid19.govt.nz/alert-levels-and-updates/history-of-the-covid-19-alert-system/)

## Other links
- Running version [here](https://glitch.com/edit/#!/relic-brick-bill)
- GeoJSON file [here](http://relic-brick-bill.glitch.me/LOIs.geojson) and also [here](https://github.com/leighghunt/covid-geojson/blob/main/lois.geojson)
- Terminal [here](https://glitch.com/edit/console.html?relic-brick-bill)

## Process
- In QGIS, use Temporal Controller plugin to create frames of animation - ensure image dimensions are using even number of pixels
- Use ffmpeg to create animation, e.g.:
```
ffmpeg -r 30 -f image2 -i NZCovid%04d.png -vcodec libx264 -crf 15  -pix_fmt yuv420p render.mp4
```