import React, { Component } from 'react';
import {
  Text,
  StyleSheet
} from 'react-native';

export default class Location extends Component {
  render() {
    return (
      <Text>{this.props.name}</Text>
    )
  }
}
