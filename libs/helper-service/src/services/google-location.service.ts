import {
  GooglePlaceDetails,
  GooglePlacePrediction,
} from '../interface';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleLocationService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}`,
      );

      return response.data.result as GooglePlaceDetails;
    } catch (error) {
      throw new Error(
        `Failed to fetch place details from Google Maps API : ${error}`,
      );
    }
  }

  async searchPlaces(query: string) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          query,
        )}&key=${this.apiKey}&components=country:ng&limit=5`,
      );

      return response.data.results;
    } catch (error) {
      throw new Error('Failed to search places from Google Maps API');
    }
  }

  async getPlaceAutocomplete(input: string): Promise<GooglePlacePrediction[]> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input,
        )}&key=${this.apiKey}&components=country:ng&limit=5`,
      );
      
      const predictions: GooglePlacePrediction[] = response.data.predictions.map(prediction => ({
        description: prediction.description,
        place_id: prediction.place_id,
        reference: prediction.reference
      }));

      return predictions;
    } catch (error) {
      throw new Error('Failed to get place autocomplete from Google Maps API');
    }
  }
}
