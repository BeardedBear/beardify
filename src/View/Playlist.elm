module View.Playlist exposing (view)

import Data.Album exposing (..)
import Data.Drawer exposing (..)
import Data.Image as Image exposing (..)
import Data.Player as Player exposing (..)
import Data.Playlist exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
import Root exposing (..)
import Utils


view : Player.Model -> PlaylistModel -> Html Msg
view player playlist =
    let
        listTracksUri id =
            playlist.tracks.items
                |> LE.dropWhile (\e -> e.track.uri /= id)
                |> List.map (\k -> k.track.uri)

        trackItem t =
            div
                [ classList
                    [ ( "track playlist-page", True )
                    , ( "active", t.track.uri == player.item.uri )
                    ]
                ]
                [ div [ class "playlist-track-left" ]
                    [ if t.track.uri == player.item.uri then
                        div [] [ i [ class "icon-play" ] [] ]

                      else
                        div [] [ i [ class "icon-music" ] [] ]
                    , div [ onClick <| ChangePlayingTrack (listTracksUri t.track.uri) ] [ text t.track.name ]
                    , div []
                        (t.track.artists
                            |> List.map (\ar -> a [ onClick (GetArtist ar.id) ] [ text ar.name ])
                        )
                    ]
                , div [ class "playlist-track-right" ]
                    [ div [] [ text (Utils.durationFormat t.track.duration_ms) ]
                    ]
                ]

        trackSumDuration =
            playlist.tracks.items
                |> List.map (\d -> d.track.duration_ms)
                |> List.sum
    in
    div [ class "album-wrapper" ]
        [ div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text playlist.playlist.name ]
            ]
        , div [ class "album-page" ]
            [ div []
                [ imageView Medium playlist.playlist.images
                , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                ]
            , div []
                [ div [] (playlist.tracks.items |> List.map trackItem)
                ]
            ]
        ]
