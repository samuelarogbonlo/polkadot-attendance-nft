#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod attendance_nft {
    use ink_storage::{
        collections::HashMap as StorageHashMap,
        traits::{PackedLayout, SpreadLayout},
    };
    use scale::{Decode, Encode};

    #[derive(Debug, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct EventInfo {
        name: String,
        date: String,
        location: String,
        organizer: String,
        event_id: String,
    }

    #[derive(Debug, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct NFTMetadata {
        event_info: EventInfo,
        token_uri: String,
        created_at: u64,
    }

    #[ink(storage)]
    pub struct AttendanceNFT {
        // Token ID => Owner
        token_owners: StorageHashMap<u32, AccountId>,
        // Owner => List of owned token IDs
        owned_tokens: StorageHashMap<AccountId, Vec<u32>>,
        // Token ID => Metadata
        token_metadata: StorageHashMap<u32, NFTMetadata>,
        // Current token ID counter
        next_token_id: u32,
        // Contract owner
        admin: AccountId,
        // Event organizers with minting permission
        authorized_minters: StorageHashMap<AccountId, bool>,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        token_id: u32,
    }

    #[ink(event)]
    pub struct Mint {
        #[ink(topic)]
        to: AccountId,
        #[ink(topic)]
        token_id: u32,
        #[ink(topic)]
        event_id: String,
    }

    impl AttendanceNFT {
        /// Constructor to initialize the NFT contract
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            let mut authorized_minters = StorageHashMap::new();
            authorized_minters.insert(caller, true);

            Self {
                token_owners: StorageHashMap::new(),
                owned_tokens: StorageHashMap::new(),
                token_metadata: StorageHashMap::new(),
                next_token_id: 1,
                admin: caller,
                authorized_minters,
            }
        }

        /// Add an authorized minter (event organizer)
        #[ink(message)]
        pub fn add_authorized_minter(&mut self, minter: AccountId) -> bool {
            let caller = self.env().caller();
            if caller != self.admin {
                return false;
            }

            self.authorized_minters.insert(minter, true);
            true
        }

        /// Remove an authorized minter
        #[ink(message)]
        pub fn remove_authorized_minter(&mut self, minter: AccountId) -> bool {
            let caller = self.env().caller();
            if caller != self.admin {
                return false;
            }

            self.authorized_minters.insert(minter, false);
            true
        }

        /// Mint a new attendance NFT
        #[ink(message)]
        pub fn mint_attendance_nft(
            &mut self,
            to: AccountId,
            event_name: String,
            event_date: String,
            event_location: String,
            event_id: String,
            token_uri: String,
        ) -> Result<u32, &'static str> {
            let caller = self.env().caller();

            // Check if caller is authorized to mint
            if !self.is_authorized_minter(caller) {
                return Err("Not authorized to mint");
            }

            let token_id = self.next_token_id;
            self.next_token_id += 1;

            // Create event info and metadata
            let event_info = EventInfo {
                name: event_name,
                date: event_date,
                location: event_location,
                organizer: caller.to_string(),
                event_id: event_id.clone(),
            };

            let metadata = NFTMetadata {
                event_info,
                token_uri,
                created_at: self.env().block_timestamp(),
            };

            // Store token ownership and metadata
            self.token_owners.insert(token_id, to);
            self.token_metadata.insert(token_id, metadata);

            // Update owned tokens list
            let mut owned = self.owned_tokens.get(&to).unwrap_or(&Vec::new()).clone();
            owned.push(token_id);
            self.owned_tokens.insert(to, owned);

            // Emit events
            self.env().emit_event(Transfer {
                from: None,
                to: Some(to),
                token_id,
            });

            self.env().emit_event(Mint {
                to,
                token_id,
                event_id,
            });

            Ok(token_id)
        }

        /// Check if an account is authorized to mint
        #[ink(message)]
        pub fn is_authorized_minter(&self, account: AccountId) -> bool {
            account == self.admin ||
            *self.authorized_minters.get(&account).unwrap_or(&false)
        }

        /// Get owner of a specific token
        #[ink(message)]
        pub fn owner_of(&self, token_id: u32) -> Option<AccountId> {
            self.token_owners.get(&token_id).cloned()
        }

        /// Get tokens owned by an account
        #[ink(message)]
        pub fn tokens_of(&self, owner: AccountId) -> Vec<u32> {
            self.owned_tokens.get(&owner).unwrap_or(&Vec::new()).clone()
        }

        /// Get metadata for a specific token
        #[ink(message)]
        pub fn token_metadata(&self, token_id: u32) -> Option<NFTMetadata> {
            self.token_metadata.get(&token_id).cloned()
        }

        /// Transfer NFT to another account
        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, token_id: u32) -> bool {
            let caller = self.env().caller();

            // Check if caller owns the token
            match self.token_owners.get(&token_id) {
                Some(owner) if *owner == caller => {
                    // Remove from current owner
                    let mut from_owned = self.owned_tokens.get(&caller).unwrap_or(&Vec::new()).clone();
                    from_owned.retain(|&t| t != token_id);
                    self.owned_tokens.insert(caller, from_owned);

                    // Add to new owner
                    let mut to_owned = self.owned_tokens.get(&to).unwrap_or(&Vec::new()).clone();
                    to_owned.push(token_id);
                    self.owned_tokens.insert(to, to_owned);

                    // Update token owner
                    self.token_owners.insert(token_id, to);

                    // Emit transfer event
                    self.env().emit_event(Transfer {
                        from: Some(caller),
                        to: Some(to),
                        token_id,
                    });

                    true
                },
                _ => false
            }
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn minting_works() {
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            let mut attendance_nft = AttendanceNFT::new();

            let token_id = attendance_nft.mint_attendance_nft(
                accounts.bob,
                String::from("Polkadot Meetup"),
                String::from("2025-04-16"),
                String::from("San Francisco"),
                String::from("EVT-123"),
                String::from("ipfs://QmHash"),
            ).unwrap();

            assert_eq!(attendance_nft.owner_of(token_id), Some(accounts.bob));
            assert_eq!(attendance_nft.tokens_of(accounts.bob), vec![token_id]);

            let metadata = attendance_nft.token_metadata(token_id).unwrap();
            assert_eq!(metadata.event_info.name, "Polkadot Meetup");
        }

        #[ink::test]
        fn transfer_works() {
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            let mut attendance_nft = AttendanceNFT::new();

            let token_id = attendance_nft.mint_attendance_nft(
                accounts.alice,
                String::from("Polkadot Meetup"),
                String::from("2025-04-16"),
                String::from("San Francisco"),
                String::from("EVT-123"),
                String::from("ipfs://QmHash"),
            ).unwrap();

            // Set caller to alice who owns the token
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);

            // Transfer to bob
            assert!(attendance_nft.transfer(accounts.bob, token_id));
            assert_eq!(attendance_nft.owner_of(token_id), Some(accounts.bob));
            assert_eq!(attendance_nft.tokens_of(accounts.bob), vec![token_id]);
            assert_eq!(attendance_nft.tokens_of(accounts.alice), vec![]);
        }

        #[ink::test]
        fn unauthorized_minting_fails() {
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            let mut attendance_nft = AttendanceNFT::new();

            // Set caller to bob who is not authorized
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.bob);

            let result = attendance_nft.mint_attendance_nft(
                accounts.charlie,
                String::from("Polkadot Meetup"),
                String::from("2025-04-16"),
                String::from("San Francisco"),
                String::from("EVT-123"),
                String::from("ipfs://QmHash"),
            );

            assert!(result.is_err());
        }
    }
}