import { systemClock, type Clock } from "./ids.js";
import { BrandProfilesRepository } from "./repositories/brand-profiles.js";
import { CampaignsRepository } from "./repositories/campaigns.js";
import { CreatorProfilesRepository } from "./repositories/creator-profiles.js";
import { DealsRepository } from "./repositories/deals.js";
import { InvitationRepository } from "./repositories/invitations.js";
import { LedgerRepository } from "./repositories/ledger.js";
import { MatchesRepository } from "./repositories/matches.js";
import { MessagesRepository } from "./repositories/messages.js";
import { OffersRepository } from "./repositories/offers.js";
import { UsersRepository } from "./repositories/users.js";
import { VoiceSessionsRepository } from "./repositories/voice-sessions.js";
import { WaitlistRepository } from "./repositories/waitlist.js";
import type { DocumentStore } from "./store.js";

export interface Repositories {
  waitlist: WaitlistRepository;
  invitations: InvitationRepository;
  users: UsersRepository;
  creatorProfiles: CreatorProfilesRepository;
  brandProfiles: BrandProfilesRepository;
  campaigns: CampaignsRepository;
  matches: MatchesRepository;
  voiceSessions: VoiceSessionsRepository;
  offers: OffersRepository;
  deals: DealsRepository;
  messages: MessagesRepository;
  ledger: LedgerRepository;
}

export function createRepositories(
  store: DocumentStore,
  clock: Clock = systemClock,
): Repositories {
  return {
    waitlist: new WaitlistRepository(store, clock),
    invitations: new InvitationRepository(store, clock),
    users: new UsersRepository(store, clock),
    creatorProfiles: new CreatorProfilesRepository(store, clock),
    brandProfiles: new BrandProfilesRepository(store, clock),
    campaigns: new CampaignsRepository(store, clock),
    matches: new MatchesRepository(store, clock),
    voiceSessions: new VoiceSessionsRepository(store, clock),
    offers: new OffersRepository(store, clock),
    deals: new DealsRepository(store, clock),
    messages: new MessagesRepository(store, clock),
    ledger: new LedgerRepository(store, clock),
  };
}
