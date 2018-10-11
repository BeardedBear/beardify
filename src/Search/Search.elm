module Search.Search exposing (Model, init, view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Types exposing (..)
import Utils


type alias Model =
    { findArtist : List Artist
    , findAlbum : List Album
    , findTrack : List Track
    , searchQuery : String
    }


init : Model
init =
    { findArtist = []
    , findAlbum = []
    , findTrack = []
    , searchQuery = ""
    }



--  VIEW


coverView : List Cover -> Html Msg
coverView cover =
    cover
        |> List.reverse
        |> List.head
        |> Maybe.withDefault { url = "" }
        |> (\c -> img [ src c.url ] [])


view : Model -> Html Msg
view model =
    div []
        [ div [] [ input [ type_ "text", onInput Query, Html.Attributes.value model.searchQuery ] [] ]
        , div [ style "float" "left", style "width" "300px" ]
            [ h2 [] [ text "Artists" ]
            , List.map (\a -> li [] [ text a.name ]) model.findArtist
                |> ul [ style "list-style" "none", style "padding" "0" ]
            ]
        , div [ style "float" "left", style "width" "300px" ]
            [ h2 [] [ text "Albums" ]
            , model.findAlbum
                |> List.filter (\a -> a.album_type == "album")
                |> List.map
                    (\a ->
                        li [ style "clear" "both", style "margin-bottom" "10px" ]
                            [ div [ class "search-cover-image", onClick (ChangePlaying a.uri) ] [ coverView a.images ]
                            , strong [] [ text <| a.name ++ " " ]
                            , text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")"
                            , br [] []
                            , small [] (List.map (\artists -> text artists.name) a.artists)
                            ]
                    )
                |> ul [ style "list-style" "none", style "padding" "0" ]
            ]
        , div [ style "float" "left" ]
            [ h2 [] [ text "Tracks" ]
            , List.map
                (\t ->
                    li []
                        [ div [ onClick (ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ text "🎵 " ]
                        , strong [] [ text t.name ]
                        , br [] []
                        , small [] (List.map (\artists -> text <| artists.name) t.artists)
                        , span [] [ text " - " ]
                        , small [] [ text t.album.name ]
                        , span [ style "float" "right" ]
                            [ text (Utils.durationFormat t.duration_ms)
                            ]
                        ]
                )
                model.findTrack
                |> ul [ style "list-style" "none", style "padding" "0" ]
            ]
        ]
