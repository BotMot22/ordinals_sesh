export interface Collection {
  slug: string;
  name: string;
  description: string;
  icon: string;
  bannerImage?: string;
  inscriptionIcon?: string;
  supply: number;
  twitterLink?: string;
  discordLink?: string;
  websiteLink?: string;
  inscriptions: string[];
}

export interface CollectionStats {
  floorPrice: number;
  totalVolume: number;
  totalListings: number;
  owners: number;
  supply: number;
}

export interface CollectionMeta {
  name: string;
  inscription_icon: string;
  icon: string;
  supply: string;
  description: string;
  twitter_link?: string;
  discord_link?: string;
  website_link?: string;
}
