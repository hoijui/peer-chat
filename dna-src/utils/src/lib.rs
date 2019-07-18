<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
#![feature(try_from)]
>>>>>>> cf17f1bb4a535935a48f8c03b264e9dd5c26b4af
>>>>>>> develop
extern crate holochain_core_types;
extern crate hdk;
extern crate serde;
#[macro_use]
extern crate serde_derive;
use hdk::{
    error::{ZomeApiError, ZomeApiResult},
    holochain_core_types::{
        entry::{AppEntryValue, Entry},
        link::LinkMatch,
    },
    holochain_json_api::{
        json::{default_to_json, JsonString},
    },
    holochain_persistence_api::{
        cas::content::{ Address, AddressableContent },
    },
};
use serde::Serialize;
use std::{convert::TryFrom, fmt::Debug};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetLinksLoadResult<T> {
    pub entry: T,
    pub address: Address,
}

impl<T: Into<JsonString> + Debug + Serialize> From<GetLinksLoadResult<T>> for JsonString {
    fn from(u: GetLinksLoadResult<T>) -> JsonString {
        default_to_json(u)
    }
}

///
/// Helper function that perfoms a try_from for every entry
/// of a get_links_and_load for a given type. Any entries that either fail to
/// load or cannot be converted to the type will be dropped.
///
pub fn get_links_and_load_type<R: TryFrom<AppEntryValue>>(
    base: &Address,
    link_type: LinkMatch<&str>,
    tag: LinkMatch<&str>,
) -> ZomeApiResult<Vec<GetLinksLoadResult<R>>> {
    let link_load_results = hdk::get_links_and_load(base, link_type, tag)?;

    Ok(link_load_results
        .iter()
        .map(|maybe_entry| match maybe_entry {
            Ok(entry) => match entry {
                Entry::App(_, entry_value) => {
                    let typed_entry = R::try_from(entry_value.to_owned()).map_err(|_| {
                        ZomeApiError::Internal(
                            "Could not convert get_links result to requested type".to_string(),
                        )
                    })?;
                    Ok((entry.address(), typed_entry))
                }
                _ => Err(ZomeApiError::Internal(
                    "get_links did not return an app entry".to_string(),
                )),
            },
            _ => Err(ZomeApiError::Internal(
                "get_links did not return an app entry".to_string(),
            )),
        })
        .filter_map(Result::ok)
        .map(|(address, entry)| GetLinksLoadResult { address, entry })
        .collect())
}

///
/// Helper function for loading an entry and converting to a given type
///
pub fn get_as_type<R: TryFrom<AppEntryValue>>(address: Address) -> ZomeApiResult<R> {
    let get_result = hdk::get_entry(&address)?;
    let entry =
        get_result.ok_or_else(|| ZomeApiError::Internal("No entry at this address".into()))?;
    match entry {
        Entry::App(_, entry_value) => R::try_from(entry_value.to_owned()).map_err(|_| {
            ZomeApiError::Internal(
                "Could not convert get_links result to requested type".to_string(),
            )
        }),
        _ => Err(ZomeApiError::Internal(
            "get_links did not return an app entry".to_string(),
        )),
    }
}

/// Creates two links:
/// From A to B, and from B to A, with given link_types.
pub fn link_entries_bidir<S: Into<String>>(
    a: &Address,
    b: &Address,
    link_type_a_b: S,
    link_type_b_a: S,
    link_tag_a_b: S,
    link_tag_b_a: S,
) -> ZomeApiResult<()> {
    hdk::link_entries(a, b, link_type_a_b, link_tag_a_b)?;
    hdk::link_entries(b, a, link_type_b_a, link_tag_b_a)?;
    Ok(())
}

/// Commits the given entry and links it from the base
/// with the given link_type.
pub fn commit_and_link<S: Into<String>>(
    entry: &Entry,
    base: &Address,
    link_type: S,
    tag: S,
) -> ZomeApiResult<Address> {
    let entry_addr = hdk::commit_entry(entry)?;
    hdk::link_entries(base, &entry_addr, link_type, tag)?;
    Ok(entry_addr)
}
