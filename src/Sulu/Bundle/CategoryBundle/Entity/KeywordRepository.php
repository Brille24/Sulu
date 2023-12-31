<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\CategoryBundle\Entity;

use Sulu\Component\Persistence\Repository\ORM\EntityRepository;

/**
 * Implementation of keyword repository.
 *
 * @extends EntityRepository<KeywordInterface>
 */
class KeywordRepository extends EntityRepository implements KeywordRepositoryInterface
{
    public function findById($id)
    {
        return $this->find($id);
    }

    public function findByKeyword($keyword, $locale)
    {
        return $this->findOneBy(['keyword' => $keyword, 'locale' => $locale]);
    }
}
