module Album exposing (Album, Cover, ListAlbum, decodeAlbum, decodeAlbumCover, decodeListAlbum, encodeAlbum, playAlbum)

import Artist exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Utils


type alias Album =
    { album_type : String
    , artists : List Artist
    , images : List Cover
    , name : String
    , release_date : String
    , type_ : String
    , uri : String
    }


type alias ListAlbum =
    { items : List Album }


type alias Cover =
    { url : String }


encodeAlbum : String -> Encode.Value
encodeAlbum uri =
    Encode.object
        [ ( "context_uri", Encode.string uri )
        ]


decodeAlbum : Decode.Decoder Album
decodeAlbum =
    Decode.map7 Album
        (Decode.field "album_type" Decode.string)
        (Decode.at [ "artists" ] (Decode.list Artist.decodeArtist))
        (Decode.at [ "images" ] (Decode.list decodeAlbumCover))
        (Decode.field "name" Decode.string)
        (Decode.field "release_date" Decode.string)
        (Decode.field "type" Decode.string)
        (Decode.field "uri" Decode.string)


decodeAlbumCover : Decode.Decoder Cover
decodeAlbumCover =
    Decode.map Cover
        (Decode.field "url" Decode.string)


decodeListAlbum : Decode.Decoder ListAlbum
decodeListAlbum =
    Decode.map ListAlbum
        (Decode.at [ "albums", "items" ] (Decode.list decodeAlbum))


playAlbum : String -> Request ()
playAlbum uri =
    request
        { method = "PUT"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ Utils.token ]
        , url = "https://api.spotify.com/v1/me/player/play"
        , body = Http.jsonBody (encodeAlbum uri)
        , expect = expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
