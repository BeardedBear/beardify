module Data.Album exposing (AlbumSimplified, Type(..), decodeSimplified, typeToString)

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
    = Album
    | AppearsOn
    | Compilation
    | Single


decodeType : Decoder Type
decodeType =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "album" ->
                        Decode.succeed Album

                    "appears_on" ->
                        Decode.succeed AppearsOn

                    "compilation" ->
                        Decode.succeed Compilation

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


typeToString : Type -> String
typeToString type_ =
    case type_ of
        Album ->
            "album"

        AppearsOn ->
            "appears on"

        Compilation ->
            "compilation"

        Single ->
            "single"
