module Data.Album exposing
    ( Album
    , decodeAlbum
    , encodeAlbum
    , init
    )

import Data.Artist as Artist exposing (..)
import Data.Image as Image exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode


init : Album
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


type alias Album =
    { album_type : String
    , artists : List ArtistSimplified
    , id : String
    , images : List Image
    , name : String
    , release_date : String
    , type_ : String
    , uri : String
    }


decodeAlbum : Decode.Decoder Album
decodeAlbum =
    Decode.map8 Album
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