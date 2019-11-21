module Data.Album exposing (AlbumSimplified, Type(..), decodeSimplified)

import Data.Artist as Artist exposing (ArtistSimplified)
import Data.Image as Image exposing (Image)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as JDP


type alias AlbumSimplified =
    { type_ : Type
    , artists : List ArtistSimplified
    , id : String
    , images : List Image
    , name : String
    , releaseDate : String
    , uri : String
    }


type Type
    = Compilation
    | Album
    | Single


decodeType : Decoder Type
decodeType =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "compilation" ->
                        Decode.succeed Compilation

                    "album" ->
                        Decode.succeed Album

                    "single" ->
                        Decode.succeed Single

                    _ ->
                        Decode.fail "Invalid Type"
            )


decodeSimplified : Decoder AlbumSimplified
decodeSimplified =
    Decode.succeed AlbumSimplified
        |> JDP.required "album_type" decodeType
        |> JDP.required "artists" (Decode.list Artist.decodeSimplified)
        |> JDP.required "id" Decode.string
        |> JDP.requiredAt [ "images" ] (Decode.list Image.decode)
        |> JDP.required "name" Decode.string
        |> JDP.required "release_date" Decode.string
        |> JDP.required "uri" Decode.string
