import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Picker,
  Linking
} from 'react-native';
import RNGooglePlaces from 'react-native-google-places';
import Polyline from '@mapbox/polyline';
import { GOOGLE_MAPS_KEY } from 'react-native-dotenv';
import MapView from 'react-native-maps';
// import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

export default class LetsDoLunch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: {
        latitude: 47.6067006,
        longitude: -122.33250089999999
      },
      friendLocation: {
        latitude: 47.252876799999996,
        longitude:  -122.4442906
      },
      locationData: [],
      midPoint: null,
      region: {},
      keyword: '',
      type: 'restaurant',
      radius: 1609
    };
    this.onRegionChange = this.onRegionChange.bind(this);
  }

  findMiddle(myLoc, theirLoc) {
      let meetLat;
      let meetLon;
      if (myLoc.latitude > 0) {
         meetLat = (myLoc.latitude + theirLoc.latitude) / 2
      } else {
        meetLat = (myLoc.latitude - theirLoc.latitude) / 2
      };
      if (myLoc.longitude > 0) {
        meetLon = (myLoc.longitude + theirLoc.longitude) / 2
      } else {
        meetLon = (myLoc.longitude - theirLoc.longitude) / 2
      }
      var midPoint = {
        latitude: meetLat,
        longitude: meetLon,
      }
      return midPoint;
    }

  pickLocation(person) {
    RNGooglePlaces.openPlacePickerModal().then((place) => {
      if (person === 'user') {
        this.setState({userLocation: place})
      } else {
        this.setState({friendLocation: place})
      }
    // place represents user's selection from the
    // suggestions and it is a simplified Google Place object.
    })
    .catch(error => console.log(error.message));  // error is a Javascript Error object
  }

  async getMidPoint(startLoc, destinationLoc) {
    try {
        console.log(startLoc, destinationLoc);
        console.log(1);
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&key=${ GOOGLE_MAPS_KEY }`);
        console.log(2);
        let respJson = await resp.json();
        console.log(respJson);
        console.log(3);
        let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
        console.log(4);
        let coords = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
        });
        console.log(5);
        console.log('coords', coords);
        console.log('length', Math.floor(coords.length / 2))
        let midLocation = coords[Math.floor(coords.length / 2)];
        return midLocation;
    } catch(error) {
        return error
    }
  }

    async findLocations(startLoc, destinationLoc) {
      try {
        console.log('SUP');
        let midLocation = await this.getMidPoint(startLoc, destinationLoc);
        console.log(midLocation);
        console.log(6);
        let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${ GOOGLE_MAPS_KEY }&location=${ midLocation.latitude },${ midLocation.longitude }&type=${this.state.type}&keyword=${ this.state.keyword }&radius=${ this.state.radius }`
        let results = await fetch(url);
        console.log(7, url);
        let resultsJson = await results.json();
        console.log(8);
        console.log(resultsJson);
        this.setState({
          locationData: resultsJson.results.slice(0, 5),
          midPoint: midLocation,
          region: this.regionContainingPoints(resultsJson.results.slice(0, 5))
        });
        console.log(this.state.locationData);
    } catch(error) {
        return error
    }
  }

  regionContainingPoints(points) {
    var minX, maxX, minY, maxY;

    // init first point
    ((point) => {
      minX = point.geometry.location.lat;
      maxX = point.geometry.location.lat;
      minY = point.geometry.location.lng;
      maxY = point.geometry.location.lng;
    })(points[0]);

    // calculate rect
    points.map((point) => {
      minX = Math.min(minX, point.geometry.location.lat);
      maxX = Math.max(maxX, point.geometry.location.lat);
      minY = Math.min(minY, point.geometry.location.lng);
      maxY = Math.max(maxY, point.geometry.location.lng);
    });

    var midX = (minX + maxX) / 2;
    var midY = (minY + maxY) / 2;
    var midPoint = [midX, midY];

    var deltaX = (maxX - minX) * 1.5;
    var deltaY = (maxY - minY) * 1.5;

    return {
      latitude: midX, longitude: midY,
      latitudeDelta: deltaX, longitudeDelta: deltaY,
    };
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  
  render() {
    let display;
    let midPointButton;
    let map = <View style={{flex: 1, backgroundColor: 'steelblue'}}>
          <Text>Step 1: Set your location.</Text>
          <Text>Step 2: Set your friends location.</Text>
          <Text>Step 3 (optional): Add keywords for to narrow your search ('lunch', 'mexican', 'teriyaki')</Text>
        </View>;
    if (this.state.midPoint) {
      console.log('map reached')
      map = <View style = {styles.container}>
        <MapView
          style           = {styles.map}
          region          = {this.state.region}
          onRegionChange  = {this.onRegionChange}
        >
          {this.state.locationData.map(marker => (
            <MapView.Marker
              coordinate={{
                latitude: marker.geometry.location.lat,
                longitude: marker.geometry.location.lng
              }}
              title={marker.name}
              description={marker.vicinity}
              key={marker.id}
              
              onCalloutPress={() => {Linking.openURL('http://www.google.com/maps/search/?api=1&query=' + marker.name.split(" ").join("+") + `&query_place_id=${marker.place_id}`)}}
            />
          ))}
        </MapView>
      </View>
    }
    if (this.state.userLocation.latitude && this.state.friendLocation.latitude) {
      midPointButton = <Button title="Find midpoint" onPress={() => this.findLocations(this.state.userLocation.latitude.toString() + ", " + this.state.userLocation.longitude.toString(), this.state.friendLocation.latitude.toString() + ", " + this.state.friendLocation.longitude.toString())} />
      }
    return (
      <View style={{flex: 1}}>
        <View style={{flex: .14, backgroundColor: 'powderblue'}}>
          <Text style={styles.heading}>
            {"Let's Do Lunch"}
          </Text>
        </View>
        <View style={{flex: 1, backgroundColor: 'skyblue'}}>
          <Button title="Set your location" onPress={() => this.pickLocation('user')} />
          <Button color="blue" title="Pick your friend's location" onPress={() => this.pickLocation('friend')} />
          <TextInput
          style={{height: 40}}
          placeholder="keywords"
          onChangeText={(text) => this.setState({keyword: text})}
          /> 
          {midPointButton}
        </View>
        <View style={{flex: 1}}>
          <Picker 
            style = {styles.picker}
            selectedValue={this.state.type}
            onValueChange={(itemValue, itemIndex) => this.setState({type:itemValue})} >
            <Picker.Item label='Restaurant' value='restaurant' />
            <Picker.Item label='Bar/Tavern' value='bar' />
            <Picker.Item label='Café' value='cafe' />
            <Picker.Item label='Park' value='park' />
          </Picker> 
          <Picker 
            style = {styles.picker}
            selectedValue={this.state.radius}
            onValueChange={(itemValue, itemIndex) => this.setState({radius:itemValue})} >
            <Picker.Item label='1 mi radius' value='1609' />
            <Picker.Item label='2 mi radius' value='3218' />
            <Picker.Item label='3 mi radius' value='4829' />
            <Picker.Item label='4 mi radius' value='6437' />
            <Picker.Item label='5 mi radius' value='8046' />
          </Picker> 
        </View>
        {map}
      </View>
    )
  }
}

// var RadioButtonProject = React.createClass({
//   getInitialState: function() {
//     return {
//       value: 0,
//     }
//   },
//   render: function() {
//     return (
//       <View>
//         <RadioForm
//           radio_props={radio_props}
//           initial={0}
//           onPress={(value) => {this.setState({type:value})}}
//         />
//       </View>
//     );
//   }
// });

// const radio_props = [
//   {label: 'restaurant', value: 0 },
//   {label: 'tavern', value: 1 }
// ];

const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center'
  },
  container: {

    height: 250,

    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    
  },
  button: {
    backgroundColor: 'red',
    fontSize: 30,
  },
  picker: {

  }
});

AppRegistry.registerComponent('LetsDoLunch', () => LetsDoLunch);
