<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\ContactBundle\Entity;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NoResultException;

/**
 * @extends EntityRepository<AccountContact>
 */
class AccountContactRepository extends EntityRepository
{
    public function findByForeignIds($accountId, $contactId)
    {
        try {
            $qb = $this->createQueryBuilder('accountContact')
                ->leftJoin('accountContact.contact', 'contact')
                ->leftJoin('accountContact.account', 'account')
                ->leftJoin('account.mainContact', 'mainContact')
                ->leftJoin('accountContact.position', 'position')
                ->addSelect('position')
                ->addSelect('mainContact')
                ->addSelect('account')
                ->where('account.id = :accountId AND contact.id = :contactId');

            $query = $qb->getQuery();
            $query->setParameter('accountId', $accountId);
            $query->setParameter('contactId', $contactId);

            return $query->getSingleResult();
        } catch (NoResultException $ex) {
            return;
        }
    }
}
