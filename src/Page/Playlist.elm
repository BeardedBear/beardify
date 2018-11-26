module Page.Playlist exposing (Msg, init, update, view)

import Data.Playlist
import Data.Root
import Data.Session exposing (Session)
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (..)
import Request.Request as Request
import Route
import Url exposing (Url, percentDecode)
import Url.Parser as Parser exposing ((</>), Parser)
import Utils



-- import Views.Playlist


init : Session -> ( Data.Root.PlaylistModel, Cmd Msg )
init session =
    ( { playlist = Data.Playlist.init
      , tracks =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [--     Http.send SetAlbum <| Request.get "albums/" (Utils.getId session.url) "" Data.Album.decodeAlbum session.token
         -- , Http.send SetAlbumTracks <| Request.get "albums/" (Utils.getId session.url) "/tracks" (Decode.at [ "items" ] (Decode.list Data.Track.decodeTrackSimplified)) session.token
        ]
    )


type Msg
    = NoOp


update : Session -> Msg -> Data.Root.PlaylistModel -> ( Data.Root.PlaylistModel, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )


view : Session -> Data.Root.PlaylistModel -> ( String, List (Html Msg) )
view session model =
    ( "model.album.name"
    , [ div [ class "topbar" ] [ text "" ]
      , div [ class "drawer" ] [ text "playlist" ]
      , div [ class "player" ] [ text "player" ]
      ]
    )
