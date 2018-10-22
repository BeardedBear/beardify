module Data.Album exposing (Album, ListAlbum, decodeAlbum, decodeArtistAlbums, decodeListAlbum, encodeAlbum)

import Data.Artist as Artist exposing (..)
import Data.Image as Image exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Utils


type alias Album =
    { album_type : String
    , artists : List Artists
    , id : String
    , images : List Image
    , name : String
    , release_date : String
    , type_ : String
    , uri : String
    }


type alias ListAlbum =
    { items : List Album }


encodeAlbum : String -> Encode.Value
encodeAlbum uri =
    Encode.object
        [ ( "context_uri", Encode.string uri )
        ]


decodeAlbum : Decode.Decoder Album
decodeAlbum =
    Decode.map8 Album
        (Decode.field "album_type" Decode.string)
        (Decode.at [ "artists" ] (Decode.list decodeArtists))
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "release_date" Decode.string)
        (Decode.field "type" Decode.string)
        (Decode.field "uri" Decode.string)


decodeListAlbum : Decode.Decoder ListAlbum
decodeListAlbum =
    Decode.map ListAlbum
        (Decode.at [ "albums", "items" ] (Decode.list decodeAlbum))


decodeArtistAlbums : Decode.Decoder ListAlbum
decodeArtistAlbums =
    Decode.map ListAlbum
        (Decode.at [ "items" ] (Decode.list decodeAlbum))
