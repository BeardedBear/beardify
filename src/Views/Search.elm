module Views.Search exposing (view)

import Data.Image as Image exposing (..)
import Data.Search as Search exposing (..)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick, onInput)
import Meta
import Route
import Utils
import Views.Artist


view : Search.Model -> Html Meta.Msg
view searchMsg =
    let
        artistItem ar =
            div [ class "artist-item" ]
                [ div [ class "img" ] [ imageView Small ar.images ]
                , a [ Route.href (Route.Artist ar.id) ] [ text ar.name ]
                ]

        albumItem al =
            div [ class "album-item" ]
                [ div [ class "search-cover-image" ] [ imageView Small al.images ]
                , div []
                    [ strong [] [ text <| al.name ++ " " ]
                    , text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")"
                    , a [ Route.href (Route.Album al.id) ] [ Views.Artist.artistList al.artists ]
                    ]
                ]

        trackItem t =
            div [ class "track-item" ]
                [ div [ class "track-icon" ] [ i [ class "icon-play" ] [] ]
                , div []
                    [ strong [] [ text t.name ]
                    , div [] [ Views.Artist.artistList t.artists ]
                    ]
                , div []
                    [ text (Utils.durationFormat t.duration_ms)
                    ]
                ]
    in
    div [ class "search" ]
        [ div []
            [ input
                [ classList [ ( "active", searchMsg.searchQuery /= "" ) ]
                , id "search"
                , placeholder "Recherche"
                , type_ "text"
                , Html.Styled.Attributes.value searchMsg.searchQuery
                , onInput Meta.Query
                ]
                []
            , if searchMsg.searchQuery /= "" then
                div [ class "results" ]
                    [ div []
                        [ div [ class "title" ] [ text "Artists" ]
                        , div [] (searchMsg.findArtist |> List.map artistItem)
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Albums" ]
                        , div []
                            (searchMsg.findAlbum
                                |> List.filter (\a -> a.album_type == "album")
                                |> List.map albumItem
                            )
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Tracks" ]
                        , div []
                            (searchMsg.findTrack |> List.map trackItem)
                        ]
                    ]

              else
                text ""
            ]
        ]
