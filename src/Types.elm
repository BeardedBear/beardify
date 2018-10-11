module Types exposing (Album, Artist, Cover, ListAlbum, ListArtist, ListTrack, Msg(..), Track)

import Browser exposing (Document)
import Http exposing (..)
import Url exposing (Url)


type Msg
    = NoOp
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | FindArtist (Result Http.Error ListArtist)
    | FindAlbum (Result Http.Error ListAlbum)
    | FindTrack (Result Http.Error ListTrack)
    | Play (Result Http.Error ())
    | PlayTrack (Result Http.Error ())
    | Query String
    | ChangePlaying String
    | ChangePlayingTrack (List String)


type alias Track =
    { name : String
    , duration_ms : Int
    , artists : List Artist
    , album : Album
    , uri : String
    }


type alias ListTrack =
    { items : List Track
    }


type alias Artist =
    { name : String
    , type_ : String
    }


type alias ListArtist =
    { items : List Artist }


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
