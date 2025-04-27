#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod attendance_nft {
    use ink::storage::Mapping;
    use ink::prelude::{string::String, vec::Vec};

    /// Represents event information
    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct EventInfo {
        name: String,        // Event name
        date: String,        // Event date
        location: String,    // Event location
        organizer: AccountId,// Event organizer
    }

    /// Represents an NFT token
    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Nft {
        id: u64,             // Unique NFT ID
        event_id: u64,       // Associated event ID
        owner: AccountId,    // NFT owner
        metadata: String,    // JSON metadata
    }

    /// Main contract storage
    #[ink(storage)]
    pub struct AttendanceNFT {
        // NFT ID -> NFT
        nfts: Mapping<u64, Nft>,
        // Event ID -> Event Info
        events: Mapping<u64, EventInfo>,
        // Account -> List of owned NFTs
        owned_nfts: Mapping<AccountId, Vec<u64>>,
        // Total NFTs minted
        nft_count: u64,
        // Total events created
        event_count: u64,
        // Contract owner
        owner: AccountId,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct EventCreated {
        #[ink(topic)]
        event_id: u64,
        #[ink(topic)]
        organizer: AccountId,
    }

    #[ink(event)]
    pub struct NFTMinted {
        #[ink(topic)]
        nft_id: u64,
        #[ink(topic)]
        recipient: AccountId,
        event_id: u64,
    }

    impl Default for AttendanceNFT {
        fn default() -> Self {
            Self::new()
        }
    }

    impl AttendanceNFT {
        /// Constructor initializes empty contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                nfts: Mapping::new(),
                events: Mapping::new(),
                owned_nfts: Mapping::new(),
                nft_count: 0,
                event_count: 0,
                owner: Self::env().caller(),
            }
        }

        /// Create a new event
        #[ink(message)]
        pub fn create_event(&mut self, name: String, date: String, location: String) -> u64 {
            let caller = self.env().caller();
            let event_id = self.event_count.checked_add(1).expect("Event count overflow");

            let event_info = EventInfo {
                name,
                date,
                location,
                organizer: caller,
            };

            self.events.insert(event_id, &event_info);
            self.event_count = event_id;

            // Emit event
            self.env().emit_event(EventCreated {
                event_id,
                organizer: caller,
            });

            event_id
        }

        /// Mint a new NFT for an event attendee
        #[ink(message)]
        pub fn mint_nft(&mut self, event_id: u64, recipient: AccountId, metadata: String) -> bool {
            let caller = self.env().caller();

            // Check if event exists
            if let Some(event) = self.events.get(event_id) {
                // Only event organizer or contract owner can mint
                if caller != event.organizer && caller != self.owner {
                    return false;
                }

                let nft_id = self.nft_count.checked_add(1).expect("NFT count overflow");

                let nft = Nft {
                    id: nft_id,
                    event_id,
                    owner: recipient,
                    metadata,
                };

                self.nfts.insert(nft_id, &nft);

                // Update owned NFTs
                let mut owned = self.owned_nfts.get(recipient).unwrap_or_default();
                owned.push(nft_id);
                self.owned_nfts.insert(recipient, &owned);

                self.nft_count = nft_id;

                // Emit event
                self.env().emit_event(NFTMinted {
                    nft_id,
                    recipient,
                    event_id,
                });

                true
            } else {
                false
            }
        }

        /// Get NFT by ID
        #[ink(message)]
        pub fn get_nft(&self, nft_id: u64) -> Option<Nft> {
            self.nfts.get(nft_id)
        }

        /// Get event by ID
        #[ink(message)]
        pub fn get_event(&self, event_id: u64) -> Option<EventInfo> {
            self.events.get(event_id)
        }

        /// Get all NFTs owned by an account
        #[ink(message)]
        pub fn get_owned_nfts(&self, owner: AccountId) -> Vec<u64> {
            self.owned_nfts.get(owner).unwrap_or_default()
        }

        /// Get total number of events
        #[ink(message)]
        pub fn get_event_count(&self) -> u64 {
            self.event_count
        }

        /// Get total number of NFTs
        #[ink(message)]
        pub fn get_nft_count(&self) -> u64 {
            self.nft_count
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        /// We test if the contract constructor works.
        #[ink::test]
        fn create_event_works() {
            // Create a new contract
            let mut contract = AttendanceNFT::new();

            // Create an event
            let event_id = contract.create_event(
                String::from("Polkadot Meetup"),
                String::from("2023-06-01"),
                String::from("Berlin")
            );

            // Verify event ID is 1
            assert_eq!(event_id, 1);

            // Verify event details
            let event = contract.get_event(event_id).unwrap();
            assert_eq!(event.name, "Polkadot Meetup");
            assert_eq!(event.date, "2023-06-01");
            assert_eq!(event.location, "Berlin");
        }

        #[ink::test]
        fn mint_nft_works() {
            // Get test accounts
            let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();

            // Create a new contract
            let mut contract = AttendanceNFT::new();

            // Create an event first
            let event_id = contract.create_event(
                String::from("Polkadot Meetup"),
                String::from("2023-06-01"),
                String::from("Berlin")
            );

            // Mint an NFT
            let success = contract.mint_nft(
                event_id,
                accounts.bob,
                String::from("{\"description\":\"Attendance proof for Polkadot Meetup\"}")
            );

            // Verify minting was successful
            assert!(success);

            // Check if Bob owns the NFT
            let bob_nfts = contract.get_owned_nfts(accounts.bob);
            assert_eq!(bob_nfts.len(), 1);

            // Check the NFT details
            let nft = contract.get_nft(bob_nfts[0]).unwrap();
            assert_eq!(nft.event_id, event_id);
            assert_eq!(nft.owner, accounts.bob);
        }

        #[ink::test]
        fn unauthorized_mint_fails() {
            // Get test accounts
            let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();

            // Create a new contract
            let mut contract = AttendanceNFT::new();

            // Create an event first (created by Alice)
            let event_id = contract.create_event(
                String::from("Polkadot Meetup"),
                String::from("2023-06-01"),
                String::from("Berlin")
            );

            // Try to mint as Bob (unauthorized)
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let success = contract.mint_nft(
                event_id,
                accounts.charlie,
                String::from("{\"description\":\"Attendance proof for Polkadot Meetup\"}")
            );

            // Verify minting failed
            assert!(!success);
        }
    }
}