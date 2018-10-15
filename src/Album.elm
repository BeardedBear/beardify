module Album exposing (Album, ListAlbum, decodeAlbum, decodeArtistAlbums, decodeListAlbum, encodeAlbum, playAlbum)

import Artist exposing (..)
import Http exposing (..)
import Image exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Token exposing (..)
import Utils


type alias Album =
    { album_type : String
    , artists : List Artists
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
    Decode.map7 Album
        (Decode.field "album_type" Decode.string)
        (Decode.at [ "artists" ] (Decode.list decodeArtists))
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


playAlbum : String -> Token -> Request ()
playAlbum uri token =
    request
        { method = "PUT"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ token.token ]
        , url = "https://api.spotify.com/v1/me/player/play"
        , body = Http.jsonBody (encodeAlbum uri)
        , expect = expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
