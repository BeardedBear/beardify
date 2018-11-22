module View.Pocket exposing
    ( btnTrack
    , btnTrackSimplified
    )

import Data.Artist exposing (..)
import Data.Drawer exposing (..)
import Data.Playlist exposing (..)
import Data.Pocket as Pocket exposing (..)
import Data.Track exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)


btnTrack : Pocket.Model -> Track -> Html Msg
btnTrack model playlistTrack =
    let
        artist ar =
            ar |> List.map .name |> List.take 1 |> String.concat
    in
    div
        [ onClick <| PocketAdd (PocketTrack (artist playlistTrack.artists) playlistTrack.name playlistTrack.uri)
        , class "toggle-pocket"
        ]
        [ if List.member playlistTrack.uri (model.tracks |> List.map .uri) then
            i [ class "icon-checked" ] []

          else
            i [ class "icon-check-empty" ] []
        ]


btnTrackSimplified : Pocket.Model -> TrackSimplified -> Html Msg
btnTrackSimplified model playlistTrack =
    let
        artist ar =
            ar |> List.map .name |> List.take 1 |> String.concat
    in
    div
        [ onClick <| PocketAdd (PocketTrack (artist playlistTrack.artists) playlistTrack.name playlistTrack.uri)
        , class "toggle-pocket"
        ]
        [ if List.member playlistTrack.uri (model.tracks |> List.map .uri) then
            i [ class "icon-checked" ] []

          else
            i [ class "icon-check-empty" ] []
        ]
