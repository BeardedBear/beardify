module Track exposing (AlbumTracks, ArtistTopTracks, ListTrack, Track, TrackSimplified, decodeAlbumTracks, decodeArtistTopTracks, decodeListTrack, decodeTrack, decodeTrackSimplified, encodeTrack, getArtistTopTracks, getTracks, putPlayTrack)

import Album exposing (..)
import Artist exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Utils


type alias Track =
    { name : String
    , duration_ms : Int
    , artists : List Artists
    , album : Album
    , uri : String
    }


type alias TrackSimplified =
    { name : String
    , duration_ms : Int
    , artists : List Artists
    , track_number : Int
    , uri : String
    }


type alias ListTrack =
    { items : List Track
    }


type alias ArtistTopTracks =
    { tracks : List Track
    }


type alias AlbumTracks =
    { items : List TrackSimplified
    }


encodeTrack : List String -> Encode.Value
encodeTrack uris =
    Encode.object
        [ ( "uris", Encode.list Encode.string uris )
        ]


decodeTrack : Decode.Decoder Track
decodeTrack =
    Decode.map5 Track
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtists))
        (Decode.at [ "album" ] decodeAlbum)
        (Decode.field "uri" Decode.string)


decodeTrackSimplified : Decode.Decoder TrackSimplified
decodeTrackSimplified =
    Decode.map5 TrackSimplified
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtists))
        (Decode.field "track_number" Decode.int)
        (Decode.field "uri" Decode.string)


decodeArtistTopTracks : Decode.Decoder ArtistTopTracks
decodeArtistTopTracks =
    Decode.map ArtistTopTracks
        (Decode.at [ "tracks" ] (Decode.list decodeTrack))


decodeAlbumTracks : Decode.Decoder AlbumTracks
decodeAlbumTracks =
    Decode.map AlbumTracks
        (Decode.at [ "items" ] (Decode.list decodeTrackSimplified))


decodeListTrack : Decode.Decoder ListTrack
decodeListTrack =
    Decode.map ListTrack
        (Decode.at [ "tracks", "items" ] (Decode.list decodeTrack))


putPlayTrack : List String -> String -> Request ()
putPlayTrack uris token =
    request
        { method = "PUT"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ token ]
        , url = "https://api.spotify.com/v1/me/player/play"
        , body = Http.jsonBody (encodeTrack uris)
        , expect = expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }


getArtistTopTracks : String -> String -> Request ArtistTopTracks
getArtistTopTracks id token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id ++ "/top-tracks?country=FR"
        , body = Http.emptyBody
        , expect = Http.expectJson decodeArtistTopTracks
        , timeout = Nothing
        , withCredentials = False
        }


getTracks : String -> String -> String -> Decode.Decoder a -> Request a
getTracks type_ id token decoder =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/" ++ type_ ++ "/" ++ id ++ "/tracks"
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }
