module Data.Album exposing
    ( Album
    , AlbumId
    , AlbumUri
    , albumInit
    , decodeAlbum
    , encodeAlbum
    )

import Data.Artist exposing (ArtistSimplified)
import Data.Image exposing (Image)
import Json.Decode as Decode exposing (Decoder(..), at, field)
import Json.Encode as Encode


type alias AlbumId =
    String


type alias AlbumUri =
    String


albumInit : Album
albumInit =
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
        (Decode.at [ "artists" ] (Decode.list Data.Artist.decodeArtistSimplified))
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list Data.Image.decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "release_date" Decode.string)
        (Decode.field "type" Decode.string)
        (Decode.field "uri" Decode.string)


encodeAlbum : String -> Encode.Value
encodeAlbum uri =
    Encode.object
        [ ( "context_uri", Encode.string uri )
        ]
