module View.Pocket exposing (btn, btn2)

import Data.Drawer exposing (..)
import Data.Playlist exposing (..)
import Data.Pocket as Pocket exposing (..)
import Data.Track
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)


btn : Pocket.Model -> PlaylistTrack -> Html Msg
btn model playlistTrack =
    let
        artist ar =
            ar |> List.map .name |> List.take 1 |> String.concat
    in
    div
        [ onClick <| PocketAdd (PocketTrack (artist playlistTrack.track.artists) playlistTrack.track.name playlistTrack.track.uri)
        , class "toggle-pocket"
        ]
        [ if List.member playlistTrack.track.uri (model.tracks |> List.map .uri) then
            i [ class "icon-checked" ] []

          else
            i [ class "icon-check-empty" ] []
        ]


btn2 : Pocket.Model -> Data.Track.TrackSimplified -> Html Msg
btn2 model playlistTrack =
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
