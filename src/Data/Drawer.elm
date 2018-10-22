module Data.Drawer exposing (AlbumModel, ArtistModel, DrawerType(..), Model, PlaylistModel, init)

import Data.Album exposing (..)
import Data.Artist exposing (..)
import Data.Playlist exposing (..)
import Data.Track exposing (..)
import Data.Youtube exposing (..)


type alias ArtistModel =
    { artist : Artist
    , albums : List Album
    , videos : List Video
    , topTracks : List Track
    , relatedArtists : List Artist
    }


type alias AlbumModel =
    { album : Album
    , tracks : List TrackSimplified
    }


type alias PlaylistModel =
    { playlist : Playlist
    , tracks : PlaylistPaging
    }


type DrawerType
    = DrawArtist
    | DrawAlbum
    | DrawPlaylist
    | DrawCollection
    | Home
    | Releases
    | Listen


type alias Model =
    { drawerType : DrawerType
    , drawerArtist : ArtistModel
    , drawerAlbum : AlbumModel
    , drawerPlaylist : PlaylistModel
    , drawerCollection : PlaylistModel
    }


init : Model
init =
    { drawerType = Home
    , drawerArtist =
        { artist =
            { id = ""
            , images = []
            , name = ""
            , popularity = 0
            , type_ = ""
            }
        , albums = []
        , videos = []
        , topTracks = []
        , relatedArtists = []
        }
    , drawerAlbum =
        { album =
            { album_type = ""
            , artists = []
            , id = ""
            , images = []
            , name = ""
            , release_date = ""
            , type_ = ""
            , uri = ""
            }
        , tracks = []
        }
    , drawerPlaylist =
        { playlist =
            { id = ""
            , images = []
            , name = ""
            , tracks =
                { items = []
                }
            , uri = ""
            }
        , tracks =
            { items = []
            }
        }
    , drawerCollection =
        { playlist =
            { id = ""
            , images = []
            , name = ""
            , tracks =
                { items = []
                }
            , uri = ""
            }
        , tracks =
            { items = []
            }
        }
    }
