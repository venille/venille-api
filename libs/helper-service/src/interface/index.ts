import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResult {
  @ApiProperty()
  url: string;
  @ApiProperty()
  public_id: string;
}

export interface GooglePlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  name: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}


export class GooglePlacePrediction {
  @ApiProperty({
    example: 'Lagos, Nigeria',
    description: 'The description of the place',
  })
  description: string;
  
  @ApiProperty({
    example: 'ChIJN1t_tDbYwoAR4upGmw5lURo',
    description: 'The place id',
  })
  place_id: string;
  
  @ApiProperty({
    example: 'ChIJN1t_tDbYwoAR4upGmw5lURo',
    description: 'The reference of the place',
  })
  reference: string;
}
