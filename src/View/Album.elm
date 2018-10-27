module View.Album exposing (view)

import Data.Album exposing (..)
import Data.Drawer exposing (..)
import Data.Image as Image exposing (..)
import Data.Player as Player exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
import Root exposing (..)
import Utils


view : Player.Model -> AlbumModel -> Html Msg
view player album =
    let
        listTracksUri id =
            album.tracks
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map (\k -> k.uri)

        trackItem t =
            div
                [ classList
                    [ ( "track album-page", True )
                    , ( "active", t.uri == player.item.uri )
                    ]
                , onClick <| ChangePlayingTrack (listTracksUri t.uri)
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
        [ div [ class "bg-cover" ] [ imageView Medium album.album.images ]
        , div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text album.album.name ]
            , div []
                [ span [] [ text "By " ]
                , span [ class "artist-name" ] (album.album.artists |> List.map (\ar -> a [ onClick (GetArtist ar.id) ] [ text ar.name ]))
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
