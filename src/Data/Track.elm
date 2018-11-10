module Data.Track exposing
    ( AlbumTracks
    , ArtistTopTracks
    , ListTrack
    , Track
    , TrackSimplified
    , decodeAlbumTracks
    , decodeArtistTopTracks
    , decodeListTrack
    , decodeTrack
    , decodeTrackSimplified
    , encodeDelCollectionAlbum
    , encodeTrack
    )

import Data.Album exposing (..)
import Data.Artist exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Utils


type alias Track =
    { name : String
    , duration_ms : Int
    , artists : List ArtistSimplified
    , album : Album
    , uri : String
    }


type alias TrackSimplified =
    { name : String
    , duration_ms : Int
    , artists : List ArtistSimplified
    , track_number : Int
    , uri : String
    }


type alias ListTrack =
    { items : List Track
    }


type alias ArtistTopTracks =
    { tracks : List Track
    }


type alias TracksForDel =
    { uri : String
    }


type alias DelTracks =
    { tracks : List TracksForDel }


type alias AlbumTracks =
    { items : List TrackSimplified
    }


encodeDelCollectionAlbumInner : String -> Encode.Value
encodeDelCollectionAlbumInner uri =
    Encode.object
        [ ( "uri", Encode.string uri )
        ]


encodeDelCollectionAlbum : List String -> Encode.Value
encodeDelCollectionAlbum uri =
    Encode.object
        [ ( "tracks", Encode.list encodeDelCollectionAlbumInner uri )
        ]


encodeTrack : List String -> Encode.Value
encodeTrack uris =
    Encode.object
        [ ( "uris", Encode.list Encode.string uris )
        ]


decodeTrack : Decode.Decoder Track
decodeTrack =
    Decode.map5 Track
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtistSimplified))
        (Decode.at [ "album" ] decodeAlbum)
        (Decode.field "uri" Decode.string)


decodeTrackSimplified : Decode.Decoder TrackSimplified
decodeTrackSimplified =
    Decode.map5 TrackSimplified
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtistSimplified))
        (Decode.field "track_number" Decode.int)
        (Decode.field "uri" Decode.string)


decodeArtistTopTracks : Decode.Decoder ArtistTopTracks
decodeArtistTopTracks =
    Decode.map ArtistTopTracks
        (Decode.at [ "tracks" ] (Decode.list decodeTrack))


decodeAlbumTracks : Decode.Decoder AlbumTracks
decodeAlbumTracks =
    Decode.map AlbumTracks
        (Decode.at [ "items" ] (Decode.list decodeTrackSimplified))


decodeListTrack : Decode.Decoder ListTrack
decodeListTrack =
    Decode.map ListTrack
        (Decode.at [ "tracks", "items" ] (Decode.list decodeTrack))
