module View.Album exposing (view)

import Album exposing (..)
import Drawer exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Image exposing (..)
import Player exposing (..)
import Root exposing (..)
import Utils


view : Player.Model -> AlbumModel -> Html Msg
view player album =
    let
        trackItem t =
            div
                [ classList
                    [ ( "track album-page", True )
                    , ( "active", t.uri == player.item.uri )
                    ]
                , onClick (ChangePlayingTrack [ t.uri ])
                ]
                [ if t.uri == player.item.uri then
                    div [] [ i [ class "icon-play" ] [] ]

                  else
                    div [] [ i [ class "icon-music" ] [] ]
                , div [] [ text <| String.fromInt t.track_number ++ "." ]
                , div [] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        trackSumDuration =
            album.tracks
                |> List.map (\d -> d.duration_ms)
                |> List.sum
    in
    div [ class "album-wrapper" ]
        [ div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text album.album.name ]
            , div []
                [ span [] [ text "By " ]
                , span [] (album.album.artists |> List.map (\ar -> a [ onClick (Get ar.id) ] [ text ar.name ]))
                ]
            ]
        , div [ class "album-page" ]
            [ div []
                [ imageView Medium album.album.images
                , div [] [ text <| Utils.releaseDateFormat album.album.release_date ]
                , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                ]
            , div []
                [ div [] (album.tracks |> List.map trackItem)
                ]
            ]
        ]
