module Data.Album exposing
    ( Model
    , decodeAlbum
    , encodeAlbum
    , init
    )

import Data.Artist as Artist exposing (..)
import Data.Image as Image exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode


init : Model
init =
    { album_type = ""
    , artists = []
    , id = ""
    , images = []
    , name = ""
    , release_date = ""
    , type_ = ""
    , uri = ""
    }


type alias Model =
    { album_type : String
    , artists : List ArtistSimplified
    , id : String
    , images : List Image
    , name : String
    , release_date : String
    , type_ : String
    , uri : String
    }


decodeAlbum : Decode.Decoder Model
decodeAlbum =
    Decode.map8 Model
        (Decode.field "album_type" Decode.string)
        (Decode.at [ "artists" ] (Decode.list decodeArtistSimplified))
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "release_date" Decode.string)
        (Decode.field "type" Decode.string)
        (Decode.field "uri" Decode.string)


encodeAlbum : String -> Encode.Value
encodeAlbum uri =
    Encode.object
        [ ( "context_uri", Encode.string uri )
        ]
