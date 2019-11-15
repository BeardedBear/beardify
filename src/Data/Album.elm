module Data.Album exposing (AlbumSimplified, decodeSimplified)

import Data.Artist as Artist exposing (ArtistSimplified)
import Data.Image as Image exposing (Image)
import Json.Decode as Decode exposing (Decoder)


type alias AlbumSimplified =
    { albumType : String
    , artists : List ArtistSimplified
    , id : String
    , images : List Image
    , name : String
    , releaseDate : String
    , type_ : String
    , uri : String
    }


decodeSimplified : Decoder AlbumSimplified
decodeSimplified =
    Decode.map8 AlbumSimplified
        (Decode.field "album_type" Decode.string)
        (Decode.field "artists" (Decode.list Artist.decodeSimplified))
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list Image.decode))
        (Decode.field "name" Decode.string)
        (Decode.field "release_date" Decode.string)
        (Decode.field "type" Decode.string)
        (Decode.field "uri" Decode.string)
