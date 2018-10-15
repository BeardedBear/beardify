module Track exposing (ListTrack, Track, decodeListTrack, decodeTrack, encodeTrack, playTrack)

import Album exposing (..)
import Artist exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Token exposing (..)
import Utils


type alias Track =
    { name : String
    , duration_ms : Int
    , artists : List Artists
    , album : Album
    , uri : String
    }


type alias ListTrack =
    { items : List Track
    }


encodeTrack : List String -> Encode.Value
encodeTrack uris =
    Encode.object
        [ ( "uris", Encode.list Encode.string uris )
        ]



-- Tracks


decodeTrack : Decode.Decoder Track
decodeTrack =
    Decode.map5 Track
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtists))
        (Decode.at [ "album" ] decodeAlbum)
        (Decode.field "uri" Decode.string)


decodeListTrack : Decode.Decoder ListTrack
decodeListTrack =
    Decode.map ListTrack
        (Decode.at [ "tracks", "items" ] (Decode.list decodeTrack))


playTrack : List String -> Token -> Request ()
playTrack uris token =
    request
        { method = "PUT"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ token.token ]
        , url = "https://api.spotify.com/v1/me/player/play"
        , body = Http.jsonBody (encodeTrack uris)
        , expect = expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
