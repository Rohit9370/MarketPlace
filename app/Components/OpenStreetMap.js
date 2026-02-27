import { Dimensions, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const OpenStreetMap = ({ 
  initialRegion, 
  markers = [], 
  onLocationSelect,
  showsUserLocation = false,
  showsMyLocationButton = false,
  style 
}) => {
  const latitude = initialRegion?.latitude || 20.9320;
  const longitude = initialRegion?.longitude || 77.7523;
  const latitudeDelta = initialRegion?.latitudeDelta || 0.5;
  const longitudeDelta = initialRegion?.longitudeDelta || 0.5;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>OpenStreetMap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        
        <!-- Leaflet CSS -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <style>
            body, #map { 
                margin: 0; 
                padding: 0; 
                width: 100%; 
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            .shop-marker {
                background-color: #3b82f6;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            
            .user-marker {
                background-color: #10b981;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            
            .destination-marker {
                background-color: #f59e0b;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            
            .drop-location-button {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1000;
                background-color: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 10px;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        ${showsMyLocationButton ? `<button class="drop-location-button" id="dropLocationBtn" onclick="toggleDropLocationMode()">Drop Location</button>` : ''}
        
        <!-- Leaflet JS -->
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            // Initialize the map
            const map = L.map('map').setView([${latitude}, ${longitude}], 13);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);
            
            // State for drop location mode
            let dropLocationMode = false;
            let temporaryMarker = null;
            
            function toggleDropLocationMode() {
                dropLocationMode = !dropLocationMode;
                document.getElementById('dropLocationBtn').textContent = dropLocationMode ? 'Cancel Drop' : 'Drop Location';
                document.getElementById('dropLocationBtn').style.backgroundColor = dropLocationMode ? '#f87171' : 'white';
                
                if (!dropLocationMode && temporaryMarker) {
                    map.removeLayer(temporaryMarker);
                    temporaryMarker = null;
                }
            }
            
            // Add markers
            const markers = ${JSON.stringify(markers)};
            
            markers.forEach(marker => {
                let iconClass = 'shop-marker';
                let iconHtml = '🏢'; // Building icon for shops
                
                if (marker.type === 'user') {
                    iconClass = 'user-marker';
                    iconHtml = '👤'; // User icon
                } else if (marker.type === 'destination') {
                    iconClass = 'destination-marker';
                    iconHtml = '📍'; // Destination icon
                }
                
                const customIcon = L.divIcon({
                    className: iconClass,
                    html: iconHtml,
                    iconSize: marker.type === 'user' ? [24, 24] : marker.type === 'destination' ? [20, 20] : [30, 30],
                    iconAnchor: marker.type === 'user' ? [12, 24] : marker.type === 'destination' ? [10, 20] : [15, 30],
                    popupAnchor: [0, -20]
                });
                
                const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: customIcon })
                    .addTo(map)
                    .bindPopup('<b>' + marker.title + '</b><br>' + marker.description);
                    
                leafletMarker.on('click', function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MARKER_PRESS',
                        shopId: marker.shopId,
                        markerType: marker.type,
                        coordinate: { lat: marker.latitude, lng: marker.longitude }
                    }));
                });
            });
            
            // Handle map clicks for location selection
            map.on('click', function(e) {
                if (dropLocationMode) {
                    // Remove any existing temporary marker
                    if (temporaryMarker) {
                        map.removeLayer(temporaryMarker);
                    }
                    
                    // Add a temporary marker at the clicked location
                    const tempIcon = L.divIcon({
                        className: 'destination-marker',
                        html: '📍',
                        iconSize: [20, 20],
                        iconAnchor: [10, 20],
                        popupAnchor: [0, -20]
                    });
                    
                    temporaryMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon: tempIcon })
                        .addTo(map)
                        .bindPopup('New Drop Location<br>Click Confirm to Save');
                    
                    // Send event to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'TEMPORARY_MARKER_DROP',
                        coordinate: { lat: e.latlng.lat, lng: e.latlng.lng }
                    }));
                } else {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_PRESS',
                        coordinate: { lat: e.latlng.lat, lng: e.latlng.lng }
                    }));
                }
            });
            
            // Watch user location if enabled
            if (${showsUserLocation}) {
                map.locate({enableHighAccuracy: true, setView: true, maxZoom: 16});
                
                map.on('locationfound', function(e) {
                    const userIcon = L.divIcon({
                        className: 'user-marker',
                        html: '👤',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24],
                        popupAnchor: [0, -20]
                    });
                    
                    L.marker(e.latlng, { icon: userIcon }).addTo(map)
                        .bindPopup('You are here').openPopup();
                        
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'LOCATION_FOUND',
                        coordinate: { lat: e.latlng.lat, lng: e.latlng.lng }
                    }));
                });
                
                map.on('locationerror', function(e) {
                    console.log('Location error:', e.message);
                });
            }
            
            // Fit bounds if we have markers
            if (markers.length > 0) {
                const group = L.featureGroup(markers.map(m => {
                    return L.marker([m.latitude, m.longitude]);
                }));
                map.fitBounds(group.getBounds().pad(0.1));
            }
            
            // Expose functions to React Native
            window.toggleDropLocationMode = toggleDropLocationMode;
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (onLocationSelect && data.type === 'MAP_PRESS') {
        if (data.coordinate) {
          onLocationSelect(data.coordinate);
        }
      } else if (onLocationSelect && data.type === 'MARKER_PRESS') {
        if (data.coordinate) {
          onLocationSelect(data.coordinate, data.shopId, data.markerType);
        }
      } else if (onLocationSelect && data.type === 'LOCATION_FOUND') {
        if (data.coordinate) {
          onLocationSelect(data.coordinate, 'user-location');
        }
      } else if (onLocationSelect && data.type === 'TEMPORARY_MARKER_DROP') {
        if (data.coordinate) {
          onLocationSelect(data.coordinate, 'temporary-drop', 'destination');
        }
      }
    } catch (error) {
      console.error('Error parsing message from webview:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={false}
        onMessage={handleMessage}
        mixedContentMode="always"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default OpenStreetMap;